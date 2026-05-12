# Сеть VPC
resource "yandex_vpc_network" "k8s" {
  name = "${var.cluster_name}-network"
}

# Подсети в трёх зонах доступности (для регионального кластера)
resource "yandex_vpc_subnet" "subnet-a" {
  name           = "${var.cluster_name}-subnet-a"
  zone           = "ru-central1-a"
  network_id     = yandex_vpc_network.k8s.id
  v4_cidr_blocks = ["10.1.0.0/16"]
}

resource "yandex_vpc_subnet" "subnet-b" {
  name           = "${var.cluster_name}-subnet-b"
  zone           = "ru-central1-b"
  network_id     = yandex_vpc_network.k8s.id
  v4_cidr_blocks = ["10.2.0.0/16"]
}

resource "yandex_vpc_subnet" "subnet-d" {
  name           = "${var.cluster_name}-subnet-d"
  zone           = "ru-central1-d"
  network_id     = yandex_vpc_network.k8s.id
  v4_cidr_blocks = ["10.3.0.0/16"]
}