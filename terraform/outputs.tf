output "cluster_id" {
  description = "Kubernetes cluster ID"
  value       = yandex_kubernetes_cluster.cluster.id
}

output "cluster_external_endpoint" {
  description = "External endpoint of the Kubernetes cluster"
  value       = yandex_kubernetes_cluster.cluster.master[0].external_v4_endpoint
}

output "kubeconfig_command" {
  description = "Command to get kubeconfig for the cluster"
  value       = "yc managed-kubernetes cluster get-credentials ${var.cluster_name} --external"
}

output "ssh_private_key" {
  description = "SSH private key for node access"
  value       = tls_private_key.ssh.private_key_pem
  sensitive   = true
}