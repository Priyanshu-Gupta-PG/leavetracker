# Leave Tracker — Flare Coston2

**Contract Address:** `0x9f3d280cc1D86146f4b450058f2389fc313F10dC`  
Explorer: https://coston2-explorer.flare.network/address/0x9f3d280cc1D86146f4b450058f2389fc313F10dC

---

## Project Title

**Leave Tracker (on Flare Coston2)** — A lightweight on-chain leave request & approval system that lets employees submit leave requests and an owner/admin approve or reject them. Built with a Solidity smart contract (ABI included) and a React + wagmi front-end for easy wallet-based interaction.

---

## Description

This project implements an on-chain leave management system deployed on the Flare Coston2 testnet. Employees can apply for leave by specifying a start and end date (as UNIX timestamps), and the contract stores leave requests per employee. The owner (typically an HR account) can review, approve, or reject requests. The front-end is a React (Next.js compatible) UI that uses `wagmi` and `viem` primitives to read contract state and send transactions.

Key components:

- `lib/contract.ts` — exports the contract address and ABI tailored for `viem`/`wagmi`.
- `hooks/useContract.ts` — a React hook that abstracts reading common contract data (owner, leave counts) and provides actions to apply, approve, and reject leaves while maintaining loading / pending / confirmation state.
- `components/sample.tsx` — a simple, wallet-gated sample UI demonstrating:
  - Applying for leave (start/end date inputs)
  - Owner-only approve and reject flows (employee address + index)
  - Transaction status (hash, confirming, confirmed)
  - Basic validation and error messages

---

## Features

- **Apply for Leave:** Employees can submit leave requests with start and end dates.
- **Owner Controls:** Contract owner can approve or reject leave requests for a specific employee and index.
- **Wallet-gated Interaction:** Connect a wallet (e.g., MetaMask) to submit transactions and read personalized data.
- **Transaction Lifecycle Feedback:** Loading, pending, confirmation, and final status are surfaced in the UI.
- **Simple, Extensible Hook:** A focused hook (`useWillContract`) presents contract data and actions while keeping error handling and transaction tracking centralized.
- **Safe Input Handling:** UI validates addresses, date ordering, and numeric indices to reduce transaction reverts.

---

## How It Solves

**Problem:** Traditional leave management systems live off-chain and require central servers, spreadsheets, or manual approvals which can be opaque and difficult to audit. For small teams, organizations, or consortia that value transparency and auditability, a compact on-chain leave tracker provides a verifiable history of requests and approvals.

**Solution & Benefits:**

- **Transparent Audit Trail:** Every leave application, approval, or rejection is a blockchain transaction. This provides immutable evidence of actions and timestamps.
- **Decentralized Verification:** Any party with access to the contract can verify whether a leave was applied/approved/rejected without relying on a central server.
- **Simplicity for Small Teams:** The contract exposes minimal, necessary functions — apply, approve, reject, and read requests — making it easy to integrate into larger on-chain HR or governance workflows.
- **Programmatic Integrations:** Other on-chain systems (payroll, attendance verification, DAO governance) can read the contract state and integrate leave status into conditional logic or automated processes.
- **Clear Ownership Model:** Only the contract owner can approve/reject, preventing unauthorized modifications while keeping the application process open to employees.

**Use Cases:**

- Small remote teams who want an auditable leave log.
- Testing / prototyping decentralized HR processes on testnets like Flare Coston2.
- Educational demos showing how on-chain records can complement traditional HR workflows.
- Integration into DAOs or multi-sig managed communities where leave or role-based absence tracking is needed.

---

## Technical Notes

- Dates in the UI are submitted as **UNIX timestamps (seconds)** (the front-end converts HTML date inputs to `Math.floor(Date.parse(...)/1000)`).
- The hook returns a compact `state` object that surfaces:
  - `isLoading` — local UI + call in progress
  - `isPending` — transaction pending
  - `isConfirming` — waiting for block confirmations
  - `isConfirmed` — transaction confirmed
  - `hash` — transaction hash when available
  - `error` — error object when calls fail
- Approve/reject actions require the owner account (the UI indicates whether the connected wallet is the owner).
- The ABI and address exported in `lib/contract.ts` are already formatted as `const` and compatible with `viem`/`wagmi` read/write hooks.

---

## Getting Started

1. Clone the repository into a Next.js / React project.
2. Install dependencies:

```powershell
npm install
```

3. Create a local environment file with credentials (do NOT commit secrets) — see `.env.example` in the project root and copy it to `.env.local` or `.env`:

```powershell
copy .env.example .env.local
# then open .env.local and replace the values with your WalletConnect Project ID
```

4. Run the app locally (Next.js dev server):

```powershell
npm run dev
```

5. Open the app in your browser: `http://localhost:3000` (or your computer's local network IP shown by Next.js).

6. Connect a wallet and use the sample component to test apply/approve/reject flows.

---

## Contract

- Address: `0x9f3d280cc1D86146f4b450058f2389fc313F10dC`  
- Explorer: https://coston2-explorer.flare.network/address/0x9f3d280cc1D86146f4b450058f2389fc313F10dC

---

## Notes & Next Steps

- Add a dedicated `fetchLeaves` method to the hook to fetch individual leaveRequests (loop over indices and call `leaveRequests(address, index)`), optionally paginated for performance.
- Add event listeners for `LeaveApplied`, `LeaveApproved`, and `LeaveRejected` to update UI reactively (via wagmi event filters or provider subscriptions).
- Improve UX by showing a table/list of leave requests with human-readable statuses and date formatting.
- Consider adding role-based access or multisig ownership for production-grade approval flows.

---
