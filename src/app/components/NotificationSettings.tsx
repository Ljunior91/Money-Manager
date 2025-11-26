"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Plus, X, Bell, Calendar, Check } from "lucide-react"
import { NotificationConfig } from "../types"

interface NotificationSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: NotificationConfig
  onSave: (config: NotificationConfig) => void
}

export default function NotificationSettings({ open, onOpenChange, config, onSave }: NotificationSettingsProps) {
  const [enabled, setEnabled] = useState(config.enabled)
  const [times, setTimes] = useState<string[]>(config.times)
  const [newTime, setNewTime] = useState("20:00")
  const [reminderDays, setReminderDays] = useState(config.reminderDays || 3)

  // Atualizar estado quando config mudar
  useEffect(() => {
    setEnabled(config.enabled)
    setTimes(config.times)
    setReminderDays(config.reminderDays || 3)
  }, [config])

  const handleSave = () => {
    const updatedConfig: NotificationConfig = {
      enabled,
      frequency: "custom",
      times,
      reminderDays,
      lastNotificationDate: config.lastNotificationDate
    }
    onSave(updatedConfig)
    onOpenChange(false)
  }

  const addTime = () => {
    if (newTime && !times.includes(newTime)) {
      setTimes([...times, newTime].sort())
    }
  }

  const removeTime = (time: string) => {
    setTimes(times.filter(t => t !== time))
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setEnabled(true)
        // Enviar notificação de teste
        new Notification("✅ Notificações Ativadas!", {
          body: "Você receberá lembretes para manter suas contas em dia!",
          icon: "/icon.svg"
        })
      } else if (permission === "denied") {
        alert("Você precisa permitir notificações nas configurações do navegador para usar este recurso.")
        setEnabled(false)
      }
    } else {
      alert("Seu navegador não suporta notificações.")
      setEnabled(false)
    }
  }

  const handleToggleNotifications = (checked: boolean) => {
    if (checked) {
      requestNotificationPermission()
    } else {
      setEnabled(false)
    }
  }

  // Calcular próxima notificação
  const getNextNotificationInfo = () => {
    if (!enabled || times.length === 0) return null
    
    const now = new Date()
    const lastDate = config.lastNotificationDate ? new Date(config.lastNotificationDate) : null
    
    if (!lastDate) {
      return `Primeira notificação será enviada hoje às ${times[0]}`
    }
    
    const nextDate = new Date(lastDate)
    nextDate.setDate(nextDate.getDate() + reminderDays)
    
    const diffTime = nextDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) {
      return `Próxima notificação: Hoje às ${times[0]}`
    } else if (diffDays === 1) {
      return `Próxima notificação: Amanhã às ${times[0]}`
    } else {
      return `Próxima notificação: Em ${diffDays} dias às ${times[0]}`
    }
  }

  const sendTestNotification = () => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🔔 Notificação de Teste", {
        body: `Você receberá lembretes a cada ${reminderDays} ${reminderDays === 1 ? 'dia' : 'dias'} nos horários: ${times.join(', ')}`,
        icon: "/icon.svg"
      })
    }
  }

  const dayOptions = [
    { value: 3, label: "A cada 3 dias", description: "Lembretes frequentes" },
    { value: 5, label: "A cada 5 dias", description: "Lembretes regulares" },
    { value: 10, label: "A cada 10 dias", description: "Lembretes espaçados" },
    { value: 15, label: "A cada 15 dias", description: "Lembretes quinzenais" },
    { value: 30, label: "A cada 30 dias", description: "Lembretes mensais" }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Bell className="w-6 h-6 text-blue-600" />
            Configurações de Notificações
          </DialogTitle>
          <DialogDescription>
            Configure lembretes personalizados para manter suas contas em dia
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Toggle de Ativação */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
            <div className="space-y-1">
              <Label className="text-base font-semibold text-gray-800">Ativar Notificações</Label>
              <p className="text-sm text-gray-600">
                Receba lembretes automáticos para registrar seus gastos
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggleNotifications}
              className="data-[state=checked]:bg-green-500"
            />
          </div>

          {enabled && (
            <>
              {/* Frequência dos Lembretes */}
              <div className="space-y-4 p-5 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-lg">
                  <Calendar className="w-5 h-5" />
                  <Label>Frequência dos Lembretes</Label>
                </div>
                <p className="text-sm text-gray-600">
                  Escolha de quantos em quantos dias você quer ser notificado
                </p>
                
                <div className="grid grid-cols-1 gap-3 mt-4">
                  {dayOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setReminderDays(option.value)}
                      className={`group relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                        reminderDays === option.value
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-green-50 shadow-lg scale-[1.02]"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            reminderDays === option.value
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300 group-hover:border-blue-400"
                          }`}>
                            {reminderDays === option.value && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <span className={`font-bold text-base block ${
                              reminderDays === option.value ? "text-blue-700" : "text-gray-700"
                            }`}>
                              {option.label}
                            </span>
                            <span className="text-xs text-gray-500">{option.description}</span>
                          </div>
                        </div>
                        <Calendar className={`w-6 h-6 transition-colors ${
                          reminderDays === option.value ? "text-blue-500" : "text-gray-400"
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-900 font-semibold">
                    💡 Você será notificado <span className="text-blue-700 font-bold">a cada {reminderDays} {reminderDays === 1 ? 'dia' : 'dias'}</span> para lembrar de registrar suas contas
                  </p>
                </div>
              </div>

              {/* Horários das Notificações */}
              <div className="space-y-4 p-5 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
                  <Bell className="w-5 h-5" />
                  <Label>Horários das Notificações</Label>
                </div>
                <p className="text-sm text-gray-600">
                  Escolha em quais horários você quer receber os lembretes
                </p>
                
                <div className="flex gap-2">
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex-1 border-2 border-gray-300 focus:border-green-500"
                  />
                  <Button
                    type="button"
                    onClick={addTime}
                    size="icon"
                    className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                {times.length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">Nenhum horário configurado</p>
                    <p className="text-sm mt-1">Adicione pelo menos um horário para receber notificações</p>
                  </div>
                )}

                <div className="space-y-2">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-gray-800 text-lg">{time}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTime(time)}
                        className="hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informação da Próxima Notificação */}
              {getNextNotificationInfo() && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-800 text-base">📅 Próximo Lembrete</p>
                      <p className="text-sm text-green-700 mt-1 font-semibold">
                        {getNextNotificationInfo()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Teste */}
              {times.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={sendTestNotification}
                  className="w-full border-2 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enviar Notificação de Teste
                </Button>
              )}

              {/* Aviso Importante */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                <p className="text-sm text-amber-900">
                  ⚠️ <strong>Importante:</strong> Certifique-se de que as notificações estão permitidas no seu navegador para receber os lembretes.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-md"
            disabled={enabled && times.length === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
