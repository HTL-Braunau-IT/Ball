# Absolventen (Alumni) Import Guide

## Overview
This system allows you to import alumni emails into the database, giving them access to special "Absolventen" tickets that are not visible to regular "Öffentlich" users.

## How It Works

### 1. Ticket Visibility Rules
- **Öffentlich tickets**: Visible to ALL users (both public and alumni)
- **Absolventen tickets**: Only visible to users whose email is in the Buyers table with groupId = "Absolventen"

### 2. User Group Assignment
When a user signs in and tries to buy tickets:
- System checks if their email exists in the `Buyers` table
- If found: Uses their assigned `groupId` (Absolventen or Öffentlich)
- If not found: Automatically assigns "Öffentlich" group when they make their first purchase

## Importing Alumni Emails

### Step 1: Prepare CSV File
Create a CSV file with the following format:

```csv
email,name
max.mustermann@example.com,Max Mustermann
anna.schmidt@example.com,Anna Schmidt
john.doe@example.com,John Doe
```

**Format Rules:**
- First line can be a header (`email,name`) or data - the system will auto-detect
- Each line: `email,name`
- Name is optional (can be empty, will be updated when they purchase)
- Email must be valid (contain `@`)

**Template:** See `scripts/alumni-template.csv` for an example

### Step 2: Access Import Page
1. Login to backend: `http://localhost:3001/backend`
2. Navigate to "Absolventen Import" in the sidebar
3. Upload your CSV file
4. Click "Importieren"

### Step 3: Review Results
The system will show:
- **Neu erstellt**: New alumni records created
- **Aktualisiert**: Existing records updated to Absolventen group
- **Übersprungen**: Alumni already in system with correct group
- **Fehler**: Any errors encountered (invalid emails, etc.)

## What Happens During Import

For each email in the CSV:

1. **If email doesn't exist in database:**
   - Creates new Buyer record
   - Sets groupId to "Absolventen"
   - Sets name from CSV (or empty if not provided)
   - Sets all other fields to empty defaults
   - Sets verified = false (will be true after email verification)

2. **If email already exists:**
   - Updates groupId to "Absolventen" (if not already)
   - Updates name if provided in CSV
   - Keeps all other existing data

## Testing the System

### Test Scenario 1: Alumni User
1. Import email: `alumni@example.com,Test Alumni`
2. Sign in with that email
3. Go to ticket purchase page
4. Should see BOTH "Öffentlich" AND "Absolventen" tickets

### Test Scenario 2: Public User  
1. Sign in with email NOT in import list
2. Go to ticket purchase page
3. Should see ONLY "Öffentlich" tickets

## Database Structure

```
Buyers Table:
- email (unique)
- name
- phone
- address, postal, province, country
- verified (boolean)
- maxTickets (default: 10)
- groupId (references buyerGroups)

buyerGroups Table:
- id
- name ("Absolventen" or "Öffentlich")

ticketReserves Table:
- type (array of buyerGroups)
- amount (available tickets)
- price
```

## Important Notes

1. **Pre-registration**: Alumni are pre-registered but still need to verify their email via magic link
2. **Data Updates**: When alumni make their first purchase, their contact details (phone, address) will be filled in
3. **Group Changes**: You can re-import the same CSV to update group assignments
4. **Duplicates**: Safe to import - system handles duplicates gracefully

## Troubleshooting

**Problem**: User can't see Absolventen tickets
- **Solution**: Check if their email is in Buyers table with groupId = Absolventen

**Problem**: Import shows errors
- **Solution**: Check CSV format - ensure emails are valid and properly formatted

**Problem**: Changes not reflected immediately
- **Solution**: User may need to sign out and sign in again to refresh their session

## Security

- Only backend users can access the import page
- Import is protected by authentication
- No public API endpoint for importing
