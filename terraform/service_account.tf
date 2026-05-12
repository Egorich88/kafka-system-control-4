# Copyright 2026 Egor Khomenko (Egorich88)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
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