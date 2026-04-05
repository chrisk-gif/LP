import type Anthropic from "@anthropic-ai/sdk";

export const AI_TOOLS: Anthropic.Tool[] = [
  {
    name: "create_task",
    description:
      "Opprett en ny oppgave i systemet. Brukes når brukeren vil legge til noe som skal gjøres.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Oppgavens tittel" },
        description: {
          type: "string",
          description: "Valgfri beskrivelse",
        },
        area: {
          type: "string",
          enum: ["asplan-viak", "ytly", "privat", "okonomi", "trening"],
          description: "Hvilket område oppgaven tilhører",
        },
        priority: {
          type: "string",
          enum: ["critical", "high", "medium", "low"],
          description: "Prioritet",
        },
        due_date: {
          type: "string",
          description: "Forfallsdato (ISO 8601)",
        },
        scheduled_date: {
          type: "string",
          description: "Planlagt dato (ISO 8601)",
        },
        scheduled_time: {
          type: "string",
          description: "Planlagt tid (HH:MM)",
        },
        estimated_minutes: {
          type: "number",
          description: "Estimert tid i minutter",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "create_event",
    description: "Opprett en ny hendelse/møte i kalenderen.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Hendelsens tittel" },
        description: { type: "string", description: "Valgfri beskrivelse" },
        area: {
          type: "string",
          enum: ["asplan-viak", "ytly", "privat", "okonomi", "trening"],
        },
        start_time: {
          type: "string",
          description: "Starttid (ISO 8601 med tidssone)",
        },
        end_time: {
          type: "string",
          description: "Sluttid (ISO 8601 med tidssone)",
        },
        all_day: { type: "boolean", description: "Heldagshendelse" },
        location: { type: "string", description: "Sted" },
        event_type: {
          type: "string",
          enum: [
            "meeting",
            "deadline",
            "reminder",
            "block",
            "personal",
            "other",
          ],
        },
      },
      required: ["title", "start_time"],
    },
  },
  {
    name: "complete_task",
    description: "Marker en oppgave som fullført.",
    input_schema: {
      type: "object" as const,
      properties: {
        task_title_search: {
          type: "string",
          description: "Søkeord for å finne oppgaven",
        },
      },
      required: ["task_title_search"],
    },
  },
  {
    name: "create_finance_item",
    description: "Opprett en ny regning, abonnement eller finanspost.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Beskrivelse av posten" },
        type: {
          type: "string",
          enum: [
            "bill",
            "subscription",
            "receipt",
            "reimbursement",
            "savings",
            "investment",
            "other",
          ],
        },
        amount: { type: "number", description: "Beløp i NOK" },
        vendor: { type: "string", description: "Leverandør/mottaker" },
        due_date: { type: "string", description: "Forfallsdato (ISO 8601)" },
        category: { type: "string", description: "Kategori" },
      },
      required: ["title", "type"],
    },
  },
  {
    name: "mark_paid",
    description: "Marker en regning eller finanspost som betalt.",
    input_schema: {
      type: "object" as const,
      properties: {
        search_term: {
          type: "string",
          description: "Søkeord for å finne finansposten",
        },
      },
      required: ["search_term"],
    },
  },
  {
    name: "log_workout",
    description: "Logg en gjennomført treningsøkt.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Type trening" },
        duration_minutes: {
          type: "number",
          description: "Varighet i minutter",
        },
        intensity: {
          type: "string",
          enum: ["easy", "moderate", "hard", "max"],
        },
        notes: { type: "string", description: "Notater om økten" },
      },
      required: ["title"],
    },
  },
  {
    name: "create_note",
    description: "Opprett et notat.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Notatets tittel" },
        content: { type: "string", description: "Innhold" },
        area: {
          type: "string",
          enum: ["asplan-viak", "ytly", "privat", "okonomi", "trening"],
        },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "query_data",
    description:
      "Hent data fra systemet for å svare på spørsmål. F.eks. aktive tilbud, oppgaver for i dag, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        query_type: {
          type: "string",
          enum: [
            "today_tasks",
            "active_tenders",
            "due_finance",
            "upcoming_events",
            "active_goals",
            "overdue_items",
            "weekly_summary",
            "training_history",
          ],
        },
        filters: {
          type: "object",
          properties: {
            area: { type: "string" },
            days_ahead: { type: "number" },
          },
        },
      },
      required: ["query_type"],
    },
  },
  {
    name: "reschedule",
    description: "Flytt en oppgave eller hendelse til ny dato/tid.",
    input_schema: {
      type: "object" as const,
      properties: {
        search_term: {
          type: "string",
          description: "Søkeord for å finne elementet",
        },
        entity_type: {
          type: "string",
          enum: ["task", "event"],
        },
        new_date: {
          type: "string",
          description: "Ny dato (ISO 8601)",
        },
        new_time: {
          type: "string",
          description: "Ny tid (HH:MM)",
        },
      },
      required: ["search_term", "new_date"],
    },
  },
];
