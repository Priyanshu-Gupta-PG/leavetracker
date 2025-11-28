"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { useWillContract } from "@/hooks/useContract"
import { isAddress } from "viem"

const SampleIntregation = () => {
  const { isConnected, address } = useAccount()
  const [startDateStr, setStartDateStr] = useState("")
  const [endDateStr, setEndDateStr] = useState("")
  const [employeeAddress, setEmployeeAddress] = useState("")
  const [actionIndex, setActionIndex] = useState("")

  const { data, actions, state } = useWillContract()

  const parseDateToUnix = (dateString: string) => {
    // dateString expected in YYYY-MM-DD (from input type="date")
    if (!dateString) return 0
    const ms = Date.parse(dateString)
    if (Number.isNaN(ms)) return 0
    return Math.floor(ms / 1000)
  }

  const handleApplyLeave = async () => {
    const start = parseDateToUnix(startDateStr)
    const end = parseDateToUnix(endDateStr)
    if (!start || !end || start > end) return
    try {
      await actions.applyLeave(start, end)
      setStartDateStr("")
      setEndDateStr("")
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleApprove = async () => {
    try {
      if (!employeeAddress || !isAddress(employeeAddress)) return
      const idx = Number(actionIndex || 0)
      if (Number.isNaN(idx) || idx < 0) return
      await actions.approveLeave(employeeAddress, idx)
      setEmployeeAddress("")
      setActionIndex("")
    } catch (err) {
      console.error("Error:", err)
    }
  }

  const handleReject = async () => {
    try {
      if (!employeeAddress || !isAddress(employeeAddress)) return
      const idx = Number(actionIndex || 0)
      if (Number.isNaN(idx) || idx < 0) return
      await actions.rejectLeave(employeeAddress, idx)
      setEmployeeAddress("")
      setActionIndex("")
    } catch (err) {
      console.error("Error:", err)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-foreground mb-3">Leave Tracker</h2>
          <p className="text-muted-foreground">Please connect your wallet to interact with the contract.</p>
        </div>
      </div>
    )
  }

  const canApply = startDateStr && endDateStr && parseDateToUnix(startDateStr) <= parseDateToUnix(endDateStr)
  const isOwner = data.owner ? (address && address.toLowerCase() === data.owner.toLowerCase()) : false
  const canAct = employeeAddress && isAddress(employeeAddress) && (actionIndex !== "" && Number(actionIndex) >= 0)

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Leave Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">Apply for leave or (owner) approve / reject requests</p>
        </div>

        {/* Contract Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Contract Owner</p>
            <p className="text-sm font-mono text-foreground break-all">{data.owner ?? "—"}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Your Leave Requests</p>
            <p className="text-2xl font-semibold text-foreground">{data.myLeaveCount}</p>
          </div>
        </div>

        {/* Apply Leave */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            <label className="block text-sm font-medium text-foreground">Apply for Leave</label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <input
              type="date"
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleApplyLeave}
            disabled={state.isLoading || state.isPending || !canApply}
            className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {state.isLoading || state.isPending ? "Submitting..." : "Apply Leave"}
          </button>
        </div>

        {/* Approve / Reject (Owner Only) */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
            <label className="block text-sm font-medium text-foreground">Approve / Reject (Owner)</label>
            {!isOwner && <span className="text-xs text-muted-foreground">(You are not the owner)</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Employee address (0x...)"
              value={employeeAddress}
              onChange={(e) => setEmployeeAddress(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <input
              type="number"
              placeholder="Leave index"
              value={actionIndex}
              onChange={(e) => setActionIndex(e.target.value)}
              min="0"
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={!isOwner || state.isLoading || state.isPending || !canAct}
              className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state.isLoading || state.isPending ? "Processing..." : "Approve"}
            </button>
            <button
              onClick={handleReject}
              disabled={!isOwner || state.isLoading || state.isPending || !canAct}
              className="flex-1 px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {state.isLoading || state.isPending ? "Processing..." : "Reject"}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {state.hash && (
          <div className="mt-6 p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Transaction Hash</p>
            <p className="text-sm font-mono text-foreground break-all mb-3">{state.hash}</p>
            {state.isConfirming && <p className="text-sm text-primary">Waiting for confirmation...</p>}
            {state.isConfirmed && <p className="text-sm text-green-500">Transaction confirmed!</p>}
          </div>
        )}

        {state.error && (
          <div className="mt-6 p-4 bg-card border border-destructive rounded-lg">
            <p className="text-sm text-destructive-foreground">Error: {state.error.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SampleIntregation
