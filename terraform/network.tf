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