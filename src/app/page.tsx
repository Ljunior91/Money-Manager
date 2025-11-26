"use client"

import { useState, useEffect } from "react"
import { Plus, TrendingUp, TrendingDown, Wallet, Bell, Upload, Settings, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddExpenseDialog from "./components/AddExpenseDialog"
import ExpenseList from "./components/ExpenseList"
import ExpenseChart from "./components/ExpenseChart"
import NotificationSettings from "./components/NotificationSettings"
import UploadExtract from "./components/UploadExtract"
import { Transaction, NotificationConfig } from "./types"
import { useToast } from "@/hooks/use-toast"

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showUploadExtract, setShowUploadExtract] = useState(false)
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    enabled: false,
    frequency: "daily",
    times: ["20:00"],
    reminderDays: 1
  })
  const { toast } = useToast()

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions")
    const savedNotificationConfig = localStorage.getItem("notificationConfig")
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
    
    if (savedNotificationConfig) {
      setNotificationConfig(JSON.parse(savedNotificationConfig))
    }
  }, [])

  // Salvar transações no localStorage
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem("transactions", JSON.stringify(transactions))
    }
  }, [transactions])

  // Função para verificar se deve enviar notificação baseado nos dias
  const shouldSendNotification = (config: NotificationConfig): boolean => {
    if (!config.enabled) return false
    
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD
    
    // Se nunca enviou notificação, pode enviar
    if (!config.lastNotificationDate) return true
    
    // Calcular diferença em dias
    const lastDate = new Date(config.lastNotificationDate)
    const diffTime = Math.abs(now.getTime() - lastDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // Verificar se passou o número de dias configurado
    return diffDays >= config.reminderDays
  }

  // Função para enviar notificação
  const sendNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💰 Lembrete Financeiro", {
        body: `Não esqueça de registrar suas contas! Você configurou lembretes a cada ${notificationConfig.reminderDays} ${notificationConfig.reminderDays === 1 ? 'dia' : 'dias'}.`,
        icon: "/icon.svg",
        badge: "/icon.svg",
        tag: "finance-reminder",
        requireInteraction: false
      })
      
      // Atualizar data da última notificação
      const updatedConfig = {
        ...notificationConfig,
        lastNotificationDate: new Date().toISOString().split('T')[0]
      }
      setNotificationConfig(updatedConfig)
      localStorage.setItem("notificationConfig", JSON.stringify(updatedConfig))
      
      // Mostrar toast também
      toast({
        title: "💰 Lembrete Financeiro",
        description: "Não esqueça de registrar suas contas!",
        duration: 5000
      })
    }
  }

  // Sistema de notificações
  useEffect(() => {
    if (!notificationConfig.enabled) return

    // Solicitar permissão para notificações se ainda não foi concedida
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          toast({
            title: "✅ Notificações ativadas",
            description: "Você receberá lembretes para registrar suas contas!",
            duration: 3000
          })
        }
      })
    }

    // Verificar se deve enviar notificação baseado nos dias
    const checkAndSendNotification = () => {
      if (!shouldSendNotification(notificationConfig)) return
      
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      // Verificar se está em um dos horários configurados
      if (notificationConfig.times.includes(currentTime)) {
        sendNotification()
      }
    }

    // Verificar a cada minuto
    const interval = setInterval(checkAndSendNotification, 60000)
    
    // Verificar imediatamente ao carregar
    checkAndSendNotification()
    
    return () => clearInterval(interval)
  }, [notificationConfig, toast])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString()
    }
    setTransactions([newTransaction, ...transactions])
    
    toast({
      title: "✅ Transação adicionada",
      description: `${transaction.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transaction.amount.toFixed(2)} registrada com sucesso!`,
      duration: 3000
    })
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id))
    
    toast({
      title: "🗑️ Transação removida",
      description: "A transação foi excluída com sucesso.",
      duration: 3000
    })
  }

  const editTransaction = (id: string, updatedData: Partial<Transaction>) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, ...updatedData } : t
    ))
    
    toast({
      title: "✏️ Transação atualizada",
      description: "As alterações foram salvas com sucesso.",
      duration: 3000
    })
  }

  const addMultipleTransactions = (newTransactions: Omit<Transaction, "id">[]) => {
    const transactionsWithIds = newTransactions.map(t => ({
      ...t,
      id: Date.now().toString() + Math.random()
    }))
    setTransactions([...transactionsWithIds, ...transactions])
    
    toast({
      title: "📄 Extrato importado",
      description: `${newTransactions.length} transações foram importadas com sucesso!`,
      duration: 3000
    })
  }

  // Calcular totais
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  
  const balance = totalIncome - totalExpense

  // Gastos por categoria
  const expensesByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Controle Financeiro
                </h1>
                <p className="text-sm text-gray-500">Organize suas finanças</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowNotificationSettings(true)}
                className="relative"
              >
                <Bell className="w-5 h-5" />
                {notificationConfig.enabled && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUploadExtract(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar Extrato
              </Button>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Gasto
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Receitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                R$ {totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total recebido</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                R$ {totalExpense.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total gasto</p>
            </CardContent>
          </Card>

          <Card className={`border-l-4 shadow-lg hover:shadow-xl transition-shadow ${
            balance >= 0 ? 'border-l-green-500' : 'border-l-orange-500'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Saldo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${
                balance >= 0 ? 'text-green-600' : 'text-orange-600'
              }`}>
                R$ {balance.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {balance >= 0 ? 'Saldo positivo' : 'Atenção ao saldo'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Conteúdo */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="overview" className="gap-2">
              <PieChart className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <TrendingDown className="w-4 h-4" />
              Transações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Gastos por Categoria</CardTitle>
                <CardDescription>
                  Visualize onde seu dinheiro está sendo gasto
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(expensesByCategory).length > 0 ? (
                  <ExpenseChart data={expensesByCategory} />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum gasto registrado ainda</p>
                    <p className="text-sm mt-2">Adicione seus gastos para ver o gráfico</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
                <CardDescription>
                  Todas as suas receitas e despesas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExpenseList
                  transactions={transactions}
                  onDelete={deleteTransaction}
                  onEdit={editTransaction}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <AddExpenseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={addTransaction}
      />

      <NotificationSettings
        open={showNotificationSettings}
        onOpenChange={setShowNotificationSettings}
        config={notificationConfig}
        onSave={(config) => {
          setNotificationConfig(config)
          localStorage.setItem("notificationConfig", JSON.stringify(config))
          
          toast({
            title: "⚙️ Configurações salvas",
            description: `Notificações configuradas para a cada ${config.reminderDays} ${config.reminderDays === 1 ? 'dia' : 'dias'}!`,
            duration: 3000
          })
        }}
      />

      <UploadExtract
        open={showUploadExtract}
        onOpenChange={setShowUploadExtract}
        onImport={addMultipleTransactions}
      />
    </div>
  )
}
