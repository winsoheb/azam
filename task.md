# NexaIoT Transformation Tasks

## Phase 1: Database Foundation
- `[x]` Update `prisma/schema.prisma` (Add Device, Telemetry, Alert, Event models)
- `[x]` Update `prisma/seed.ts` (Add 10 mock devices, telemetry, IoT knowledge base)
- `[x]` Push schema and seed database

## Phase 2: Core Customer UI
- `[x]` Refactor `TrackingTimeline` to a generic `StatusTimeline` component
- `[x]` Update Customer Sidebar navigation (`layout.tsx`)
- `[x]` Build `/devices` page (Fleet Grid)
- `[x]` Build `/devices/[id]` page (Detailed view with Recharts)
- `[x]` Overhaul Customer Dashboard to show Fleet Health and Recent Alerts

## Phase 3: AI Diagnostic Copilot
- `[x]` Build the AI Diagnostic Panel UI
- `[x]` Implement Mock IoT Tools (`get_sensor_readings`, `run_diagnostics`, etc.)
- `[x]` Update `live-ai.ts` to utilize tools and evaluate confidence

## Phase 4: Agent & Admin Workflows
- `[x]` Update Agent Dashboard to show IoT escalations
- `[x]` Update Ticket pages to include Telemetry Snapshots
- `[x]` Final testing and Walkthrough generation

## Phase 5: Chatbot Widget
- `[x]` Implement `GET /api/chat/history` endpoint to fetch user's active conversation
- `[x]` Build `ChatWidget` with floating UI, predefined FAQs, and "New Chat" capability
- `[x]` Integrate `ChatWidget` into the Customer Portal layout

## Phase 6: AI RAG Implementation
- `[x]` Fetch KnowledgeBase datasets in `live-ai.ts`
- `[x]` Implement Retrieval-Augmented Generation for the AI system prompt
- `[x]` Fix NVIDIA NIM API model configuration
