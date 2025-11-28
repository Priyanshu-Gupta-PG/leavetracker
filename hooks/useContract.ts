"use client"

import { useState, useEffect } from "react"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { contractABI, contractAddress } from "@/lib/contract"

export interface LeaveData {
  startDate: number
  endDate: number
  status: number
}

export interface ContractData {
  owner: `0x${string}` | null
  myLeaveCount: number
  leaves: LeaveData[]
}

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: `0x${string}` | undefined
  error: Error | null
}

export interface ContractActions {
  applyLeave: (startDate: number, endDate: number) => Promise<void>
  approveLeave: (employee: string, index: number) => Promise<void>
  rejectLeave: (employee: string, index: number) => Promise<void>
}

export const useWillContract = () => {
  // keep the exported hook name the same to avoid breaking imports
  const { address } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [leaves, setLeaves] = useState<LeaveData[]>([])

  // read owner (useful to gate approve/reject in UI)
  const { data: owner, refetch: refetchOwner } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "owner",
  })

  // read leave count for current account (if available)
  const { data: myLeaveCount, refetch: refetchMyLeaveCount } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "getLeaveCount",
    args: address ? [address as `0x${string}`] : undefined,
    // wagmi's useReadContract doesn't accept an explicit enabled property in all versions;
    // passing undefined args when address is missing prevents the call.
  })

  const { writeContractAsync, data: hash, error, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchOwner()
      refetchMyLeaveCount()
    }
  }, [isConfirmed, refetchOwner, refetchMyLeaveCount])

  // Note: leaveRequests is a mapping (address => index => struct). Fetching the full list
  // would require calling leaveRequests for each index. To keep this hook simple and reliable
  // across different wagmi versions we only provide the count + a method to refresh counts.
  // The UI can query individual leaveRequests by index using useReadContract if needed.

  const applyLeave = async (startDate: number, endDate: number) => {
    // startDate and endDate should be unix timestamps (seconds)
    if (!startDate || !endDate) return

    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "applyLeave",
        args: [BigInt(startDate), BigInt(endDate)],
      })
    } catch (err) {
      console.error("Error applying leave:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const approveLeave = async (employee: string, index: number) => {
    if (!employee || index < 0) return

    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "approveLeave",
        args: [employee as `0x${string}`, BigInt(index)],
      })
    } catch (err) {
      console.error("Error approving leave:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const rejectLeave = async (employee: string, index: number) => {
    if (!employee || index < 0) return

    try {
      setIsLoading(true)
      await writeContractAsync({
        address: contractAddress,
        abi: contractABI,
        functionName: "rejectLeave",
        args: [employee as `0x${string}`, BigInt(index)],
      })
    } catch (err) {
      console.error("Error rejecting leave:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const data: ContractData = {
    owner: owner ? (owner as `0x${string}`) : null,
    myLeaveCount: myLeaveCount ? Number(myLeaveCount as bigint) : 0,
    leaves,
  }

  const actions: ContractActions = {
    applyLeave,
    approveLeave,
    rejectLeave,
  }

  const state: ContractState = {
    isLoading: isLoading || isPending || isConfirming,
    isPending,
    isConfirming,
    isConfirmed,
    hash,
    error,
  }

  return {
    data,
    actions,
    state,
  }
}
