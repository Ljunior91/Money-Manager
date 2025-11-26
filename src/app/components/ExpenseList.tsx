"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2, TrendingUp, TrendingDown, Edit, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../types"

interface ExpenseListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  onEdit: (id: string, updatedTransaction: Partial<Transaction>) => void
}

export default function ExpenseList({ transactions, onDelete, onEdit }: ExpenseListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editForm, setEditForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
    notes: ""
  })

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setEditForm({
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      notes: transaction.notes || ""
    })
  }

  const handleSaveEdit = () => {
    if (!editingTransaction) return

    const updatedData: Partial<Transaction> = {
      amount: parseFloat(editForm.amount),
      category: editForm.category,
      description: editForm.description,
      date: editForm.date,
      notes: editForm.notes
    }

    onEdit(editingTransaction.id, updatedData)
    setEditingTransaction(null)
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhuma transação registrada ainda</p>
        <p className="text-sm mt-2">Comece adicionando seus gastos e receitas</p>
      </div>
    )
  }

  const categories = editingTransaction?.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  return (
    <>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start gap-4 flex-1">
              <div className={`p-2 rounded-full ${
                transaction.type === "income" 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-red-100 text-red-600"
              }`}>
                {transaction.type === "income" ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">
                    {transaction.category}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                {transaction.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {transaction.description}
                  </p>
                )}
                {transaction.notes && (
                  <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                    <FileText className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">
                      {transaction.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold ${
                  transaction.type === "income" ? "text-blue-600" : "text-red-600"
                }`}>
                  {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditClick(transaction)}
                className="text-gray-400 hover:text-blue-600"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(transaction.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>
              Atualize as informações da transação
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Valor (R$)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select
                value={editForm.category}
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                placeholder="Ex: Almoço no restaurante"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Anotações</Label>
              <Textarea
                id="edit-notes"
                placeholder="Adicione observações ou lembretes sobre esta transação..."
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTransaction(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
