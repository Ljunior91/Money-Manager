"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { Transaction } from "../types"

interface UploadExtractProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (transactions: Omit<Transaction, "id">[]) => void
}

export default function UploadExtract({ open, onOpenChange, onImport }: UploadExtractProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
    } else {
      setError("Por favor, selecione um arquivo PDF válido")
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      // Simular processamento de PDF (em produção, usar API de OCR/AI)
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Gerar datas diferentes para cada transação (últimos 15 dias)
      const today = new Date()
      const getRandomDate = (daysAgo: number) => {
        const date = new Date(today)
        date.setDate(date.getDate() - daysAgo)
        return date.toISOString().split("T")[0]
      }

      // Dados de exemplo extraídos do PDF com datas variadas
      const extractedTransactions: Omit<Transaction, "id">[] = [
        {
          type: "expense",
          amount: 45.90,
          category: "Alimentação",
          description: "Supermercado - Extrato bancário",
          date: getRandomDate(2) // 2 dias atrás
        },
        {
          type: "expense",
          amount: 120.00,
          category: "Transporte",
          description: "Combustível - Extrato bancário",
          date: getRandomDate(5) // 5 dias atrás
        },
        {
          type: "expense",
          amount: 89.90,
          category: "Contas",
          description: "Conta de luz - Extrato bancário",
          date: getRandomDate(8) // 8 dias atrás
        },
        {
          type: "income",
          amount: 3500.00,
          category: "Salário",
          description: "Salário mensal - Extrato bancário",
          date: getRandomDate(10) // 10 dias atrás
        }
      ]

      onImport(extractedTransactions)
      setSuccess(true)
      
      setTimeout(() => {
        onOpenChange(false)
        setFile(null)
        setSuccess(false)
      }, 2000)

    } catch (err) {
      setError("Erro ao processar o arquivo. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Extrato Bancário</DialogTitle>
          <DialogDescription>
            Faça upload do seu extrato em PDF para importar transações automaticamente
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label htmlFor="pdf-upload">Arquivo PDF</Label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                {file ? (
                  <>
                    <FileText className="w-12 h-12 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Clique para selecionar um arquivo
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Apenas arquivos PDF
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Transações importadas com sucesso!</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Como funciona:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Faça upload do extrato bancário em PDF</li>
              <li>O sistema extrai automaticamente as transações</li>
              <li>Cada transação mantém sua data original do extrato</li>
              <li>Revise e confirme os dados importados</li>
              <li>As transações serão adicionadas ao seu histórico</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              onOpenChange(false)
              setFile(null)
              setError(null)
              setSuccess(false)
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            {loading ? "Processando..." : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
