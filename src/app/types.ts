export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
  notes?: string // Campo para anotações
}

export interface NotificationConfig {
  enabled: boolean
  frequency: "daily" | "twice" | "three-times" | "custom"
  times: string[]
  reminderDays: number // Frequência de lembretes em dias
  lastNotificationDate?: string // Data da última notificação enviada
}

export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas",
  "Outros"
]

export const INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Investimentos",
  "Outros"
]
