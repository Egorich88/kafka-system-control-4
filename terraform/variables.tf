variable "cloud_id" {
  description = "Yandex Cloud ID"
  type        = string
}

variable "folder_id" {
  description = "Yandex Cloud Folder ID"
  type        = string
}

variable "zone" {
  description = "Default availability zone"
  type        = string
  default     = "ru-central1-a"
}

variable "cluster_name" {
  description = "Kubernetes cluster name"
  type        = string
  default     = "kafka-system-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.33"
}

variable "node_cores" {
  description = "Number of CPU cores for nodes"
  type        = number
  default     = 2
}

variable "node_memory" {
  description = "Memory in GB for nodes"
  type        = number
  default     = 4
}

variable "node_disk_size" {
  description = "Disk size in GB for nodes"
  type        = number
  default     = 64
}

variable "node_count" {
  description = "Number of nodes in node group"
  type        = number
  default     = 2
}

variable "yc_token" {
  description = "Yandex Cloud OAuth token"
  type        = string
  sensitive   = true
}