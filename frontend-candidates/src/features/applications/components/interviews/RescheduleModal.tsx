'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  Send,
  Info
} from 'lucide-react'
import { CandidateInterviewItem, AvailableSlot } from '../../types/application.types'
import { candidateInterviewsApi } from '../../services/candidate-interviews.api'

interface RescheduleModalProps {
  isOpen: boolean
  onClose: () => void
  interview: CandidateInterviewItem | null
  onSuccess: () => void
}

export function RescheduleModal({
  isOpen,
  onClose,
  interview,
  onSuccess
}: RescheduleModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  // Helper to format date string to YYYY-MM-DD
  const getInitialDate = (interviewDate?: string) => {
    if (!interviewDate) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    }
    const d = new Date(interviewDate)
    if (isNaN(d.getTime())) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    }
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false)
  
  // Single-select index for candidate
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(0)
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false)

  // Custom Slot inputs
  const [customStartTime, setCustomStartTime] = useState<string>('14:00')
  const [customEndTime, setCustomEndTime] = useState<string>('15:00')
  const [reasonText, setReasonText] = useState<string>('')

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isHRProposed = interview?.confirmationStatus === 'ADMIN_PROPOSED' && (interview?.proposedSlots?.length || 0) > 0

  // Initialize selectedDate when modal opens
  useEffect(() => {
    if (isOpen && interview) {
      const initD = getInitialDate(interview.date)
      setSelectedDate(initD)
      setErrorMsg(null)
    }
  }, [isOpen, interview])

  // Fetch slots whenever selectedDate or interview changes (if not choosing from HR proposed list)
  useEffect(() => {
    if (!isOpen || !interview || !selectedDate || isHRProposed) return

    const fetchSlots = async () => {
      setIsLoadingSlots(true)
      setErrorMsg(null)
      try {
        const interviewerId =
          typeof interview.interviewerId === 'object'
            ? interview.interviewerId._id
            : interview.interviewerId || interview.interviewerIds?.[0]?._id
        
        const list = await candidateInterviewsApi.getAvailableSlots(interviewerId, selectedDate)
        setSlots(list || [])
        
        if (list && list.length > 0) {
          const firstAvail = list.findIndex((s) => s.isAvailable !== false)
          if (firstAvail >= 0) {
            setSelectedSlotIndex(firstAvail)
            setIsCustomMode(false)
          } else {
            setSelectedSlotIndex(null)
            setIsCustomMode(false)
          }
        } else {
          setSlots([])
          setSelectedSlotIndex(null)
        }
      } catch (err) {
        console.error('Lỗi khi tải khung giờ khả dụng:', err)
      } finally {
        setIsLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [isOpen, interview, selectedDate, isHRProposed])

  if (!isOpen || !interview || !mounted) return null

  const currentRescheduleCount = (interview.rescheduleCount || 0) + 1
  const minDateStr = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    // Mode A: Candidate choosing 1 from HR proposed slots
    if (isHRProposed) {
      if (selectedSlotIndex === null || !interview.proposedSlots?.[selectedSlotIndex]) {
        setErrorMsg('Vui lòng chọn 1 khung giờ phỏng vấn từ danh sách đề xuất của HR.')
        return
      }

      const chosen = interview.proposedSlots[selectedSlotIndex]
      const chosenDateStr = new Date(chosen.date).toISOString().split('T')[0]

      setIsSubmitting(true)
      try {
        const ok = await candidateInterviewsApi.acceptProposedSlot(interview._id, {
          date: chosenDateStr,
          startTime: chosen.startTime,
          endTime: chosen.endTime,
        })
        if (ok) {
          onSuccess()
          onClose()
        } else {
          setErrorMsg('Xác nhận lịch phỏng vấn thất bại. Vui lòng thử lại!')
        }
      } catch (err) {
        console.error('Lỗi khi xác nhận lịch phỏng vấn HR đề xuất:', err)
        setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại!')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Mode B: Candidate requesting reschedule (picking 1 slot)
    if (!selectedDate) {
      setErrorMsg('Vui lòng chọn ngày phỏng vấn mong muốn.')
      return
    }

    let startTime = ''
    let endTime = ''

    if (isCustomMode) {
      if (!customStartTime || !customEndTime) {
        setErrorMsg('Vui lòng nhập giờ bắt đầu và giờ kết thúc.')
        return
      }
      startTime = customStartTime
      endTime = customEndTime
    } else {
      if (selectedSlotIndex === null || !slots[selectedSlotIndex]) {
        setErrorMsg('Vui lòng chọn 1 khung giờ khả dụng trong ngày.')
        return
      }
      const chosen = slots[selectedSlotIndex]
      if (chosen.isAvailable === false) {
        setErrorMsg('Khung giờ này người phỏng vấn đã bận. Vui lòng chọn khung giờ khác.')
        return
      }
      startTime = chosen.startTime
      endTime = chosen.endTime
    }

    setIsSubmitting(true)

    try {
      const payload: any = {
        reason: reasonText,
        selectedSlot: {
          date: selectedDate,
          startTime,
          endTime
        }
      }

      const ok = await candidateInterviewsApi.submitRescheduleRequest(interview._id, payload)
      if (ok) {
        onSuccess()
        onClose()
      } else {
        setErrorMsg('Gửi đề nghị đổi lịch thất bại. Vui lòng thử lại!')
      }
    } catch (err) {
      console.error('Lỗi khi gửi đổi lịch:', err)
      setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại!')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date for header display (DD/MM/YYYY)
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    const parts = dateStr.split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
    return dateStr
  }

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-amber-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  {isHRProposed ? 'Chọn lịch phỏng vấn HR đề xuất' : 'Đề nghị đổi lịch phỏng vấn'}
                </h2>
                {!isHRProposed && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    Lần {currentRescheduleCount}/2
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Vị trí: <strong className="text-slate-700">{interview.jobDescriptionId?.title}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isHRProposed ? (
            /* HR PROPOSED SLOTS SELECTION */
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-xs text-emerald-950 leading-relaxed flex items-start gap-2.5">
                <Info size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Nhà tuyển dụng đã đề xuất các khung giờ sau:</span>
                  <span>Vui lòng chọn <strong>1 khung giờ duy nhất</strong> phù hợp với bạn để chốt lịch phỏng vấn.</span>
                </div>
              </div>

              <div className="space-y-2">
                {interview.proposedSlots?.map((slotItem, idx) => {
                  const dateFormatted = formatDateDisplay(new Date(slotItem.date).toISOString().split('T')[0])
                  const isSelected = selectedSlotIndex === idx

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSlotIndex(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50/90 border-amber-400 text-amber-950 font-bold shadow-xs'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={12} className="stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-bold block text-slate-900">
                            {slotItem.startTime} - {slotItem.endTime}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Ngày {dateFormatted}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* STANDARD CANDIDATE RESCHEDULE FLOW */
            <>
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-900 leading-relaxed flex items-start gap-2.5">
                <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Quy trình chọn lịch 2 bước</span>
                  <span>
                    <strong>Bước 1:</strong> Chọn ngày bạn mong muốn phỏng vấn.<br/>
                    <strong>Bước 2:</strong> Chọn <strong>1 khung giờ duy nhất</strong> trong ngày đó.
                  </span>
                </div>
              </div>

              {/* STEP 1: Select Date */}
              <div className="space-y-2 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon size={16} className="text-amber-600" />
                  <span>Bước 1: Chọn ngày phỏng vấn mong muốn</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                />
              </div>

              {/* STEP 2: Select Time Slot for Selected Date (Single Select) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={16} className="text-amber-600" />
                    <span>Bước 2: Chọn khung giờ phỏng vấn ngày {formatDateDisplay(selectedDate)}</span>
                  </label>
                </div>

                {isLoadingSlots ? (
                  <div className="py-10 text-center text-slate-500 text-xs flex flex-col items-center gap-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <Loader2 size={24} className="animate-spin text-amber-600" />
                    <span>Đang kiểm tra lịch làm việc ngày {formatDateDisplay(selectedDate)}...</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {slots.map((slot, idx) => {
                      const isAvailable = slot.isAvailable !== false
                      const isSelected = !isCustomMode && selectedSlotIndex === idx && isAvailable

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!isAvailable) return
                            setIsCustomMode(false)
                            setSelectedSlotIndex(idx)
                          }}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                            !isAvailable
                              ? 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                              : isSelected
                              ? 'bg-amber-50/90 border-amber-400 text-amber-950 font-bold shadow-xs cursor-pointer'
                              : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-700 font-medium cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                !isAvailable
                                  ? 'border-slate-300 bg-slate-200'
                                  : isSelected
                                  ? 'border-amber-600 bg-amber-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check size={12} className="stroke-[3]" />}
                            </div>
                            <span className={`text-xs sm:text-sm font-semibold ${!isAvailable ? 'line-through text-slate-400' : ''}`}>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                        </div>
                      )
                    })}

                    {/* Custom Time Option */}
                    <div
                      onClick={() => setIsCustomMode(true)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isCustomMode
                          ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 font-bold shadow-xs'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100/80 text-slate-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isCustomMode
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isCustomMode && <Check size={12} className="stroke-[3]" />}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">
                          Hoặc nhập giờ tùy chỉnh trong ngày này
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Time Inputs if Custom Mode is Active */}
              {isCustomMode && (
                <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                        Giờ bắt đầu <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customStartTime}
                        onChange={(e) => setCustomStartTime(e.target.value)}
                        placeholder="14:00"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                        Giờ kết thúc <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customEndTime}
                        onChange={(e) => setCustomEndTime(e.target.value)}
                        placeholder="15:00"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reason Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Lý do xin đổi lịch <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                </label>
                <textarea
                  rows={3}
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  placeholder="Vui lòng nhập lý do để nhà tuyển dụng dễ dàng thu xếp..."
                  className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all resize-none"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>{isHRProposed ? 'Xác nhận khung giờ này' : 'Gửi đề nghị đổi lịch'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
