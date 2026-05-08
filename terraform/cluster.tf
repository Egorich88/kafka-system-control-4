# Генерация SSH-ключа для доступа к узлам (опционально)
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

# Ресурс кластера Kubernetes (региональный)
resource "yandex_kubernetes_cluster" "cluster" {
  name        = var.cluster_name
  description = "Managed Kubernetes cluster for Kafka System Control"

  network_id = yandex_vpc_network.k8s.id

  master {
    version = var.kubernetes_version
    regional {
      region = "ru-central1"

      location {
        zone      = yandex_vpc_subnet.subnet-a.zone
        subnet_id = yandex_vpc_subnet.subnet-a.id
      }

      location {
        zone      = yandex_vpc_subnet.subnet-b.zone
        subnet_id = yandex_vpc_subnet.subnet-b.id
      }

      location {
        zone      = yandex_vpc_subnet.subnet-d.zone
        subnet_id = yandex_vpc_subnet.subnet-d.id
      }
    }

    public_ip = true

    maintenance_policy {
      auto_upgrade = true

      maintenance_window {
        start_time = "22:00"
        duration   = "4h"
      }
    }
  }

  service_account_id      = yandex_iam_service_account.k8s.id
  node_service_account_id = yandex_iam_service_account.node.id

  release_channel         = "STABLE"
  network_policy_provider = "CALICO"

  # Диапазоны IP для подов и сервисов
  cluster_ipv4_range = "10.4.0.0/16"
  service_ipv4_range = "10.5.0.0/16"

  labels = {
    environment = "test"
    project     = "kafka-system-control"
    managed-by  = "terraform"
  }

  depends_on = [
    yandex_resourcemanager_folder_iam_member.k8s-editor,
    yandex_resourcemanager_folder_iam_member.node-puller
  ]
}

# Группа узлов (Node Group)
resource "yandex_kubernetes_node_group" "main" {
  name        = "${var.cluster_name}-node-group"
  description = "Main node group for application workloads"

  cluster_id = yandex_kubernetes_cluster.cluster.id

  instance_template {
    platform_id = "standard-v3"
    resources {
      cores         = var.node_cores
      memory        = var.node_memory
      core_fraction = 100
    }

    boot_disk {
      type = "network-ssd"
      size = var.node_disk_size
    }

    network_interface {
      subnet_ids = [
        yandex_vpc_subnet.subnet-a.id,
        yandex_vpc_subnet.subnet-b.id,
        yandex_vpc_subnet.subnet-d.id
      ]
      nat = true
    }

    metadata = {
      ssh-keys = "ubuntu:${tls_private_key.ssh.public_key_openssh}"
    }
  }

  # ЯВНО УКАЗЫВАЕМ ЗОНЫ ДЛЯ РАЗМЕЩЕНИЯ НОД
  allocation_policy {
    location {
      zone = yandex_vpc_subnet.subnet-a.zone
    }
    location {
      zone = yandex_vpc_subnet.subnet-b.zone
    }
    location {
      zone = yandex_vpc_subnet.subnet-d.zone
    }
  }

  scale_policy {
    fixed_scale {
      size = var.node_count
    }
  }

  maintenance_policy {
    auto_upgrade = true
    auto_repair  = true

    maintenance_window {
      start_time = "23:00"
      duration   = "4h"
    }
  }

  labels = {
    environment = "test"
    project     = "kafka-system-control"
    managed-by  = "terraform"
  }
}