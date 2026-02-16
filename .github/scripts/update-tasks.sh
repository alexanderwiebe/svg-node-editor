#!/usr/bin/env bash
#
# update-tasks.sh — Update TASKS.md based on project board transitions.
#
# Usage:
#   update-tasks.sh in-progress <issue_number> <issue_title>
#   update-tasks.sh done        <issue_number> <issue_title>
#
set -euo pipefail

ACTION="$1"
ISSUE_NUMBER="$2"
ISSUE_TITLE="$3"
TASKS_FILE="TASKS.md"

if [ ! -f "$TASKS_FILE" ]; then
  echo "TASKS.md not found"
  exit 1
fi

# Find the line range for the section matching "## <N>." (e.g., "## 3. Node Creation")
SECTION_START=$(grep -n "^## ${ISSUE_NUMBER}\." "$TASKS_FILE" | head -1 | cut -d: -f1 || true)

if [ -z "$SECTION_START" ]; then
  echo "No section found for issue #${ISSUE_NUMBER}, appending new section"

  # Append a new section
  cat >> "$TASKS_FILE" <<EOF

---

## ${ISSUE_NUMBER}. ${ISSUE_TITLE}

> Status: $([ "$ACTION" = "done" ] && echo "Done" || echo "In Progress")

- [ ] (auto-created section — add subtasks here)
EOF
  exit 0
fi

# Find the end of this section (next "---" or "## " heading, or EOF)
TOTAL_LINES=$(wc -l < "$TASKS_FILE")
SECTION_END=$(tail -n +"$((SECTION_START + 1))" "$TASKS_FILE" | grep -n "^---$" | head -1 | cut -d: -f1 || true)

if [ -n "$SECTION_END" ]; then
  SECTION_END=$((SECTION_START + SECTION_END - 1))
else
  SECTION_END="$TOTAL_LINES"
fi

echo "Section for issue #${ISSUE_NUMBER}: lines ${SECTION_START}-${SECTION_END}"

# Check if a status line already exists in this section
STATUS_LINE=$(sed -n "${SECTION_START},${SECTION_END}p" "$TASKS_FILE" | grep -n "^> Status:" | head -1 | cut -d: -f1 || true)

case "$ACTION" in
  in-progress)
    NEW_STATUS="> Status: In Progress"

    if [ -n "$STATUS_LINE" ]; then
      # Replace existing status line
      ACTUAL_LINE=$((SECTION_START + STATUS_LINE - 1))
      sed -i "${ACTUAL_LINE}s|.*|${NEW_STATUS}|" "$TASKS_FILE"
    else
      # Insert status line after the heading
      sed -i "${SECTION_START}a\\
\\
${NEW_STATUS}" "$TASKS_FILE"
    fi
    ;;

  done)
    NEW_STATUS="> Status: Done"

    if [ -n "$STATUS_LINE" ]; then
      ACTUAL_LINE=$((SECTION_START + STATUS_LINE - 1))
      sed -i "${ACTUAL_LINE}s|.*|${NEW_STATUS}|" "$TASKS_FILE"
    else
      sed -i "${SECTION_START}a\\
\\
${NEW_STATUS}" "$TASKS_FILE"
    fi

    # Check all checkboxes in this section
    sed -i "${SECTION_START},${SECTION_END}s/- \[ \]/- [x]/g" "$TASKS_FILE"
    ;;

  *)
    echo "Unknown action: $ACTION (expected 'in-progress' or 'done')"
    exit 1
    ;;
esac

echo "Updated TASKS.md for issue #${ISSUE_NUMBER} → ${ACTION}"
