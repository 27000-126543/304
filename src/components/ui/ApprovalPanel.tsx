import { useState } from 'react'
import { Check, X, Plus, ChevronRight, FileText, MessageSquare } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { ScheduleProposal } from '@/types'

const stepLabels = ['调度员', '站长', '局领导'] as const
const stepKeys = ['dispatcher', 'station_manager', 'bureau'] as const

const proposalStatusBadge: Record<string, string> = {
  draft: 'badge-idle',
  dispatcher_approved: 'badge-collecting',
  station_approved: 'badge-warning',
  bureau_approved: 'badge-normal',
  rejected: 'badge-critical',
}

const proposalStatusLabel: Record<string, string> = {
  draft: '草稿',
  dispatcher_approved: '调度已批',
  station_approved: '站长已批',
  bureau_approved: '已批准',
  rejected: '已驳回',
}

function ApprovalSteps({ proposal }: { proposal: ScheduleProposal }) {
  return (
    <div className="flex items-center gap-0.5 mt-1">
      {stepKeys.map((key, i) => {
        const approval = proposal.approvals.find(a => a.level === key)
        const isApproved = approval?.result === 'approved'
        const isRejected = approval?.result === 'rejected'

        return (
          <div key={key} className="flex items-center gap-0.5">
            <div
              className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center text-[8px] border',
                isApproved && 'bg-[#00e5a0]/20 border-[#00e5a0] text-[#00e5a0]',
                isRejected && 'bg-[#ff3d57]/20 border-[#ff3d57] text-[#ff3d57]',
                !isApproved && !isRejected && 'bg-[#1a2a4a]/50 border-[#1a2a4a] text-[#6b7c93]'
              )}
            >
              {isApproved ? <Check className="w-2.5 h-2.5" /> : isRejected ? <X className="w-2.5 h-2.5" /> : <span>{i + 1}</span>}
            </div>
            {i < stepKeys.length - 1 && (
              <ChevronRight className="w-2.5 h-2.5 text-[#1a2a4a]" />
            )}
          </div>
        )
      })}
    </div>
  )
}

function getNextLevel(proposal: ScheduleProposal): 'dispatcher' | 'station_manager' | 'bureau' | null {
  if (proposal.status === 'rejected') return null
  if (proposal.status === 'draft') return 'dispatcher'
  if (proposal.status === 'dispatcher_approved') return 'station_manager'
  if (proposal.status === 'station_approved') return 'bureau'
  return null
}

const roleApprovalMap: Record<string, string[]> = {
  dispatcher: ['dispatcher'],
  station_manager: ['station_manager'],
  bureau_leader: ['bureau'],
}

export default function ApprovalPanel() {
  const { scheduleProposals, approveSchedule, submitSchedule, currentUser } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formVehicleCount, setFormVehicleCount] = useState(3)
  const [formRouteNotes, setFormRouteNotes] = useState('')
  const [commentInput, setCommentInput] = useState<Record<string, string>>({})

  const canSubmit = currentUser?.role === 'dispatcher'
  const userApprovableLevels: string[] = currentUser ? (roleApprovalMap[currentUser.role] ?? []) : []

  function handleSubmit() {
    if (!formTitle.trim()) return
    submitSchedule({
      title: formTitle,
      predictedVolume: 5000,
      vehicleCount: formVehicleCount,
      routeOptimization: formRouteNotes,
    })
    setFormTitle('')
    setFormVehicleCount(3)
    setFormRouteNotes('')
    setShowForm(false)
  }

  function handleApprove(proposalId: string, level: 'dispatcher' | 'station_manager' | 'bureau') {
    const comment = commentInput[proposalId] || '同意'
    approveSchedule(proposalId, level, currentUser?.name ?? '系统', 'approved', comment)
    setCommentInput(prev => { const next = { ...prev }; delete next[proposalId]; return next })
  }

  function handleReject(proposalId: string, level: 'dispatcher' | 'station_manager' | 'bureau') {
    const comment = commentInput[proposalId] || '驳回'
    approveSchedule(proposalId, level, currentUser?.name ?? '系统', 'rejected', comment)
    setCommentInput(prev => { const next = { ...prev }; delete next[proposalId]; return next })
  }

  return (
    <div className="bg-[#0d1a30]/95 border border-[#1a2a4a] backdrop-blur-md rounded overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a2a4a]">
        <span className="text-xs font-medium text-[#e0e8f0]">三级审批</span>
        {canSubmit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30 hover:bg-[#00e5a0]/25 transition-colors"
          >
            <Plus className="w-3 h-3" />
            新提案
          </button>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto">
        {showForm && (
          <div className="p-2.5 border-b border-[#1a2a4a] bg-[#0a1628]/60 space-y-2">
            <input
              type="text"
              placeholder="提案标题"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full px-2 py-1 rounded text-[10px] bg-[#0f1f3d] border border-[#1a2a4a] text-[#e0e8f0] placeholder-[#6b7c93] outline-none focus:border-[#00e5a0]/40"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                max={10}
                value={formVehicleCount}
                onChange={e => setFormVehicleCount(parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 rounded text-[10px] bg-[#0f1f3d] border border-[#1a2a4a] text-[#e0e8f0] outline-none focus:border-[#00e5a0]/40 font-mono"
                placeholder="车辆数"
              />
              <input
                type="text"
                placeholder="路线优化备注"
                value={formRouteNotes}
                onChange={e => setFormRouteNotes(e.target.value)}
                className="flex-1 px-2 py-1 rounded text-[10px] bg-[#0f1f3d] border border-[#1a2a4a] text-[#e0e8f0] placeholder-[#6b7c93] outline-none focus:border-[#00e5a0]/40"
              />
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={handleSubmit}
                className="flex-1 py-1 rounded text-[10px] bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/30 hover:bg-[#00e5a0]/25 transition-colors"
              >
                提交
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-1 rounded text-[10px] bg-[#1a2a4a]/40 text-[#6b7c93] border border-[#1a2a4a] hover:bg-[#1a2a4a]/60 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {scheduleProposals.length === 0 && !showForm && (
          <div className="px-3 py-4 text-xs text-[#6b7c93] text-center">暂无审批提案</div>
        )}

        {scheduleProposals.map(proposal => {
          const nextLevel = getNextLevel(proposal)
          const canApproveThisLevel = nextLevel !== null && userApprovableLevels.includes(nextLevel)
          return (
            <div key={proposal.id} className="px-3 py-2 border-b border-[#1a2a4a]/50 hover:bg-[#0f1f3d]/60 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-[#42a5f5]" />
                  <span className="text-[10px] text-[#e0e8f0]">{proposal.title}</span>
                </div>
                <span className={cn('status-badge', proposalStatusBadge[proposal.status])}>
                  {proposalStatusLabel[proposal.status]}
                </span>
              </div>

              <ApprovalSteps proposal={proposal} />

              {canApproveThisLevel && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-2.5 h-2.5 text-[#6b7c93]" />
                    <input
                      type="text"
                      placeholder="审批意见（可选）"
                      value={commentInput[proposal.id] || ''}
                      onChange={e => setCommentInput(prev => ({ ...prev, [proposal.id]: e.target.value }))}
                      className="flex-1 px-1.5 py-0.5 rounded text-[9px] bg-[#0f1f3d] border border-[#1a2a4a] text-[#e0e8f0] placeholder-[#6b7c93] outline-none focus:border-[#00e5a0]/40"
                    />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleApprove(proposal.id, nextLevel)}
                      className="flex-1 flex items-center justify-center gap-0.5 py-0.5 rounded text-[9px] bg-[#00e5a0]/15 text-[#00e5a0] border border-[#00e5a0]/20 hover:bg-[#00e5a0]/25 transition-colors"
                    >
                      <Check className="w-2.5 h-2.5" />
                      通过
                    </button>
                    <button
                      onClick={() => handleReject(proposal.id, nextLevel)}
                      className="flex-1 flex items-center justify-center gap-0.5 py-0.5 rounded text-[9px] bg-[#ff3d57]/15 text-[#ff3d57] border border-[#ff3d57]/20 hover:bg-[#ff3d57]/25 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                      驳回
                    </button>
                  </div>
                </div>
              )}

              {proposal.approvals.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {proposal.approvals.map(a => (
                    <div key={a.id} className="flex items-center gap-1 text-[8px]">
                      <span className={cn(
                        a.result === 'approved' ? 'text-[#00e5a0]' : 'text-[#ff3d57]'
                      )}>
                        {a.level === 'dispatcher' ? '调度' : a.level === 'station_manager' ? '站长' : '局'}:
                      </span>
                      <span className="text-[#e0e8f0]">{a.approver}</span>
                      <span className="text-[#6b7c93]">{a.timestamp}</span>
                      {a.comment && <span className="text-[#6b7c93]">「{a.comment}」</span>}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-[9px] text-[#6b7c93] mt-0.5">
                车辆: <span className="font-mono text-[#e0e8f0]">{proposal.vehicleCount}</span>
                {proposal.routeOptimization && (
                  <span className="ml-2">路线: <span className="text-[#e0e8f0]">{proposal.routeOptimization}</span></span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
