# Сервисный аккаунт для управления кластером
resource "yandex_iam_service_account" "k8s" {
  name        = "k8s-cluster-sa"
  description = "Service account for Kubernetes cluster"
}

# Назначение роли editor на каталог
resource "yandex_resourcemanager_folder_iam_member" "k8s-editor" {
  folder_id = var.folder_id
  role      = "editor"
  member    = "serviceAccount:${yandex_iam_service_account.k8s.id}"
}

# Сервисный аккаунт для узлов (нод)
resource "yandex_iam_service_account" "node" {
  name        = "k8s-node-sa"
  description = "Service account for Kubernetes nodes"
}

# Назначение роли container-registry.images.puller для узлов
resource "yandex_resourcemanager_folder_iam_member" "node-puller" {
  folder_id = var.folder_id
  role      = "container-registry.images.puller"
  member    = "serviceAccount:${yandex_iam_service_account.node.id}"
}