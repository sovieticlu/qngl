Saisine (PE_NUMBER)
├── Language, Status, Type, Format
├── Organs (main, 1st, 2nd), Working Groups (1st, 2nd)
├── Courrier Numbers
├── GEDA Senders / Receivers
├── Documents
│   ├── Document Type, Document Language
│   └── Translations (FDR)
│       ├── Organ, Doc Type, Meeting Site, Edition Site
│       └── Translation Languages
│           └── Language name lookup
└── Meetings (via PQT_SD)
    ├── Site, Organ, Meeting Status          ← query 9
    ├── Points (via PQT_MEETING_POINT)       ← query 10  ★ NEW
    │   └── Decisions (via PQT_POINT_DECI)   ← query 11  ★ NEW
    └── Other Saisines on same meeting       ← query 12  ★ NEW


-- ================================================================
-- SAISINE FULL EXPORT — Text output for UI recreation
-- Run all queries with the same PE_NUMBER value
-- ================================================================

-- ┌─────────────────────────────────────────────────────────────┐
-- │  1. MAIN SAISINE INFO                                       │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== SAISINE ===' AS "Section",
    l.LETTER_ID       AS "ID",
    l.PE_NUMBER        AS "PE Number",
    l.ECH_NUMBER       AS "Echeancier Nr",
    l.LETTER_NUMBER    AS "Letter Nr",
    l.OLD_PENUM        AS "Old PE Number",
    l.GEDA_REF         AS "GEDA Ref",
    st.STATUS_VALUE    AS "Status",
    tp.LETTER_TYPE     AS "Type",
    fmt.LETTER_SUBTYPE AS "Format",
    lang.TEXT          AS "Language",
    l.OBJECT_FR        AS "Object FR",
    l.OBJECT_EN        AS "Object EN",
    l.INTRA_OBJECT     AS "Title Intra",
    l.TXT_COMMENT      AS "Comment",
    l.EXT_SENDER       AS "External Sender",
    l.DG_RESPONSABLE   AS "DG Responsable",
    l.MODELE_TYPE      AS "Model Type",
    l.RULE_NUM         AS "Rule Number",
    l.PAGE_CNT         AS "Pages",
    CASE WHEN l.CONFIDENTIAL = 1 THEN 'Yes' ELSE 'No' END     AS "Confidential",
    CASE WHEN l.ANNEX = 1 THEN 'Yes' ELSE 'No' END           AS "Has Annex",
    CASE WHEN l.FOLLOW_UP_LETTER = 1 THEN 'Yes' ELSE 'No' END AS "Follow-Up",
    CASE WHEN l.SAISINE_FROM_BACKLOG = 1 THEN 'Yes' ELSE 'No' END AS "From Backlog",
    TO_CHAR(l.LETTER_DATE,             'DD/MM/YYYY HH24:MI') AS "Letter Date",
    TO_CHAR(l.RECEIVED,                'DD/MM/YYYY HH24:MI') AS "Received",
    TO_CHAR(l.DELAY,                   'DD/MM/YYYY HH24:MI') AS "Delay",
    TO_CHAR(l.RESPONSE_DATE,           'DD/MM/YYYY HH24:MI') AS "Response Date",
    TO_CHAR(l.PROPOSED_MEET,           'DD/MM/YYYY HH24:MI') AS "Proposed Meeting",
    TO_CHAR(l.DEC_DATE,                'DD/MM/YYYY HH24:MI') AS "Decision Date",
    TO_CHAR(l.TRANSFERT_DATE_SAISINE,  'DD/MM/YYYY HH24:MI') AS "Transfer Date",
    l.CREATION_USER    AS "Created By",
    TO_CHAR(l.CREATION_DATE,           'DD/MM/YYYY HH24:MI') AS "Created",
    l.MODIFICATION_USER AS "Modified By",
    TO_CHAR(l.MODIFICATION_DATE,       'DD/MM/YYYY HH24:MI') AS "Modified"
FROM PRQ.PQT_LETTER l
    LEFT JOIN PRQ.PQT_STATUS st           ON st.STATUS_ID         = l.STATUS_ID
    LEFT JOIN PRQ.PQT_LETTER_TYPE tp      ON tp.LETTER_TYPE_ID    = l.LETTER_TYPE_ID
    LEFT JOIN PRQ.PQT_LETTER_SUBTYPE fmt  ON fmt.LETTER_SUBTYPE_ID = l.LETTER_SUBTYPE_ID
    LEFT JOIN PRQ.PQT_LANGUAGE lang       ON lang.LANGUAGE         = l.LANGUAGE
WHERE l.PE_NUMBER = :peNumber;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  2. ORGANS & WORKING GROUPS                                 │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== ORGANS & WORKING GROUPS ===' AS "Section",
    org.ABBREVIATION || ' - ' || org.NAME               AS "Main Organ (Service)",
    o1.ABBREVIATION  || ' - ' || o1.NAME                AS "First Organ",
    o2.ABBREVIATION  || ' - ' || o2.NAME                AS "Second Organ",
    wg1.NAME || ' (' || wg1.GROUP_NAME || ')'           AS "1st Working Group",
    wg2.NAME || ' (' || wg2.GROUP_NAME || ')'           AS "2nd Working Group"
FROM PRQ.PQT_LETTER l
    LEFT JOIN PRQ.PQT_SERVICE    org ON org.SERVICE_ID    = l.SERVICE_ID
    LEFT JOIN PRQ.PQT_SERVICE    o1  ON o1.SERVICE_ID     = l.FIRST_ORGAN_ID
    LEFT JOIN PRQ.PQT_SERVICE    o2  ON o2.SERVICE_ID     = l.SECOND_ORGAN_ID
    LEFT JOIN PRQ.PQT_WORK_GROUP wg1 ON wg1.WORK_GROUP_ID = l.WORK_GROUP_ONE_ID
    LEFT JOIN PRQ.PQT_WORK_GROUP wg2 ON wg2.WORK_GROUP_ID = l.WORK_GROUP_TWO_ID
WHERE l.PE_NUMBER = :peNumber;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  3. COURRIER NUMBERS                                        │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== COURRIER NUMBERS ===' AS "Section",
    cr.COURRIER_NBR            AS "Courrier Nr"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_LETTER_COURRIER cr ON cr.LETTER_ID = l.LETTER_ID
WHERE l.PE_NUMBER = :peNumber
ORDER BY cr.COURRIER_NBR;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  4. GEDA SENDERS (Internal)                                 │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== GEDA SENDERS ===' AS "Section",
    gs.ENTITY_ID           AS "ID",
    gs.NAME                AS "Name",
    gs.FUNCTION            AS "Function",
    gs.ORGA_SERV_NAME      AS "Org Service"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_SAISINE_GEDA sg ON sg.LETTER_ID = l.LETTER_ID
    JOIN PRQ.PQT_GEDA_ENTITY gs  ON gs.ENTITY_ID = sg.ENTITY_ID
WHERE l.PE_NUMBER = :peNumber
ORDER BY gs.NAME;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  5. GEDA RECEIVERS (Internal)                               │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== GEDA RECEIVERS ===' AS "Section",
    gr.ENTITY_ID             AS "ID",
    gr.NAME                  AS "Name",
    gr.FUNCTION              AS "Function",
    gr.ORGA_SERV_NAME        AS "Org Service"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_SAISINE_GEDA_REC sgr ON sgr.LETTER_ID = l.LETTER_ID
    JOIN PRQ.PQT_GEDA_ENTITY gr       ON gr.ENTITY_ID  = sgr.ENTITY_ID
WHERE l.PE_NUMBER = :peNumber
ORDER BY gr.NAME;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  6. DOCUMENTS                                               │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== DOCUMENTS ===' AS "Section",
    doc.DOCUMENT_ID     AS "Doc ID",
    doc.NAME            AS "Name",
    doc.TITLE           AS "Title",
    dt.DOC_TYPE         AS "Type",
    dt.DESCRIPTION      AS "Type Desc",
    dlang.TEXT           AS "Language",
    doc.PATH            AS "Path",
    doc.URL             AS "URL",
    doc.VERSION         AS "Version",
    CASE WHEN doc.CONFIDENTIAL = 1 THEN 'Yes' ELSE 'No' END AS "Confidential",
    doc.COMPENDIUM_VERSION                                    AS "Compendium Ver",
    TO_CHAR(doc.COMPENDIUM_REVISION, 'DD/MM/YYYY')           AS "Revision Date",
    TO_CHAR(doc.DECISION_DATE,       'DD/MM/YYYY')           AS "Decision Date",
    TO_CHAR(doc.APP_DATE,            'DD/MM/YYYY')           AS "Application Date"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_SAISINE_DOCUMENT sd_doc ON sd_doc.LETTER_ID  = l.LETTER_ID
    JOIN PRQ.PQT_DOCUMENT doc            ON doc.DOCUMENT_ID    = sd_doc.DOCUMENT_ID
    LEFT JOIN PRQ.PQT_DOCUMENT_TYPE dt   ON dt.DOC_TYPE_ID     = doc.DOC_TYPE_ID
    LEFT JOIN PRQ.PQT_LANGUAGE dlang     ON dlang.LANGUAGE      = doc.LANGUAGE
WHERE l.PE_NUMBER = :peNumber
ORDER BY doc.DOCUMENT_ID;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  7. TRANSLATIONS (FDR) per Document                         │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== TRANSLATIONS (FDR) ===' AS "Section",
    doc.DOCUMENT_ID              AS "Parent Doc ID",
    doc.NAME                     AS "Parent Doc Name",
    tr.ID                        AS "FDR ID",
    tr.NUM_FDR                   AS "FDR Number",
    tr.NOM_DOCUMENT              AS "Title",
    tr.FILE_NAME                 AS "File Name",
    tr.STATUS                    AS "Status",
    tr.CODE_CONF                 AS "Confidential",
    tr.TEMPLATE                  AS "Template",
    tr.TEMPLATE_COMMENT          AS "Template Comment",
    tr.OWNER                     AS "Owner",
    tr_dt.DOC_TYPE               AS "Doc Type",
    tr_org.ABBREVIATION || ' - ' || tr_org.NAME  AS "Requesting Organ",
    tr.TEL_RESPONSABLE           AS "Phone",
    tr.DESTINATAIRE              AS "Recipient",
    tr.OBSERVATION               AS "Observation",
    tr.MOTIF_REFUS               AS "Why Refused",
    tr.ASKED_BY                  AS "Asked By",
    tr.REF_AUTRE_DOCUMENTS       AS "Other Doc Ref",
    tr.AUTRE_LANGUE_OR           AS "Other Orig Language",
    tr.NBR_PAGES_AUTRE_LANGUE_OR AS "Other Lang Pages",
    tr_site.SITE_NAME            AS "Meeting Site",
    TO_CHAR(tr.DATE_REUNION,         'DD/MM/YYYY HH24:MI') AS "Meeting Date",
    tr_esite.SITE_NAME           AS "Edition Site",
    TO_CHAR(tr.DEADLINE_TRADUCTION,  'DD/MM/YYYY HH24:MI') AS "Deadline Translation",
    TO_CHAR(tr.DEADLINE_EDITION,     'DD/MM/YYYY HH24:MI') AS "Deadline Edition",
    TO_CHAR(tr.DEADLINE_PRODUCTION,  'DD/MM/YYYY HH24:MI') AS "Deadline Production",
    TO_CHAR(tr.TRANSMIS,             'DD/MM/YYYY HH24:MI') AS "Transmis"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_SAISINE_DOCUMENT sd_doc ON sd_doc.LETTER_ID   = l.LETTER_ID
    JOIN PRQ.PQT_DOCUMENT doc            ON doc.DOCUMENT_ID     = sd_doc.DOCUMENT_ID
    JOIN PRQ.PQT_TRANSLATION tr          ON tr.DOCUMENT_ID      = doc.DOCUMENT_ID
    LEFT JOIN PRQ.PQT_SERVICE tr_org     ON tr_org.SERVICE_ID   = tr.SERVICE_ID
    LEFT JOIN PRQ.PQT_DOCUMENT_TYPE tr_dt ON tr_dt.DOC_TYPE_ID  = tr.DOCUMENT_TYPE
    LEFT JOIN PRQ.PQT_SITE tr_site       ON tr_site.SITE_ID     = tr.LIEU_REUNION
    LEFT JOIN PRQ.PQT_SITE tr_esite      ON tr_esite.SITE_ID    = tr.CODE_DU_LIEU_EDITION
WHERE l.PE_NUMBER = :peNumber
ORDER BY doc.DOCUMENT_ID, tr.NUM_FDR;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  8. TRANSLATION LANGUAGES per Translation                   │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== TRANSLATION LANGUAGES ===' AS "Section",
    tr.ID                            AS "Parent FDR ID",
    tr.NUM_FDR                       AS "Parent FDR Nr",
    tl.ID                            AS "TransLang ID",
    tl_lang.TEXT                     AS "Language",
    tl.LANGUAGE                      AS "Lang Code",
    tl.NBR_PAGES                     AS "Pages",
    tl.DUPLICATION                   AS "Duplication",
    tl.ORIGINAL                      AS "Original",
    tl.TRANSLATION                   AS "Translation",
    tl.ENDED                         AS "Ended",
    tl.TRANSLATED_FILE               AS "Translated File",
    tl.TRANS_FILE_PATH               AS "File Path",
    tl.TRANS_FILE_URL                AS "File URL",
    CASE WHEN tl.DISPLAY_TRAD = 1 THEN 'Yes' ELSE 'No' END  AS "Display",
    TO_CHAR(tl.DEADLINE_TRADUCTION, 'DD/MM/YYYY HH24:MI')    AS "Deadline Translation",
    TO_CHAR(tl.DEADLINE_EDITION,    'DD/MM/YYYY HH24:MI')    AS "Deadline Edition",
    TO_CHAR(tl.RECEIVED_TRAD,      'DD/MM/YYYY HH24:MI')    AS "Received"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_SAISINE_DOCUMENT sd_doc   ON sd_doc.LETTER_ID    = l.LETTER_ID
    JOIN PRQ.PQT_DOCUMENT doc              ON doc.DOCUMENT_ID      = sd_doc.DOCUMENT_ID
    JOIN PRQ.PQT_TRANSLATION tr            ON tr.DOCUMENT_ID       = doc.DOCUMENT_ID
    JOIN PRQ.PQT_TRANSLATION_LANGUAGE tl   ON tl.TRANSLATION_ID    = tr.ID
    LEFT JOIN PRQ.PQT_LANGUAGE tl_lang     ON tl_lang.LANGUAGE     = tl.LANGUAGE
WHERE l.PE_NUMBER = :peNumber
ORDER BY tr.ID, tl.LANGUAGE;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  9. MEETINGS                                                │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== MEETINGS ===' AS "Section",
    m.MEETING_ID       AS "Meeting ID",
    TO_CHAR(m.MEETING_DATE, 'DD/MM/YYYY HH24:MI') AS "Meeting Date",
    mo.ABBREVIATION || ' - ' || mo.NAME            AS "Organ",
    ms.SITE_NAME       AS "Site",
    m.COMMENTS         AS "Comments",
    CASE WHEN sd.SD_REPORTED = 1 THEN 'Yes' ELSE 'No' END AS "Reported",
    CASE WHEN sd.SD_MODIFIED = 1 THEN 'Yes' ELSE 'No' END AS "Modified",
    CASE WHEN sd.SD_STOCKED  = 1 THEN 'Yes' ELSE 'No' END AS "Stocked"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_SD sd           ON sd.LETTER_ID   = l.LETTER_ID
    JOIN PRQ.PQT_MEETING m       ON m.MEETING_ID   = sd.MEETING_ID
    LEFT JOIN PRQ.PQT_SITE ms   ON ms.SITE_ID      = m.SITE_ID
    LEFT JOIN PRQ.PQT_SERVICE mo ON mo.SERVICE_ID   = m.SERVICE_ID
WHERE l.PE_NUMBER = :peNumber
ORDER BY m.MEETING_DATE;



-- ┌─────────────────────────────────────────────────────────────┐
-- │  10. MEETING POINTS                                         │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== MEETING POINTS ===' AS "Section",
    m.MEETING_ID             AS "Meeting ID",
    TO_CHAR(m.MEETING_DATE, 'DD/MM/YYYY HH24:MI') AS "Meeting Date",
    mo.ABBREVIATION || ' - ' || mo.NAME            AS "Meeting Organ",
    ms.SITE_NAME             AS "Meeting Site",
    mst.STATUS_VALUE         AS "Meeting Status",
    mp.POINT_ORDER           AS "Point Order",
    p.POINT_ID               AS "Point ID",
    p.REFERENCE              AS "Point Reference",
    p.TITLE                  AS "Point Title"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_SD sd             ON sd.LETTER_ID    = l.LETTER_ID
    JOIN PRQ.PQT_MEETING m         ON m.MEETING_ID    = sd.MEETING_ID
    JOIN PRQ.PQT_MEETING_POINT mp  ON mp.MEETING_ID   = m.MEETING_ID
    JOIN PRQ.PQT_POINT p           ON p.POINT_ID      = mp.POINT_ID
    LEFT JOIN PRQ.PQT_SERVICE mo   ON mo.SERVICE_ID    = m.SERVICE_ID
    LEFT JOIN PRQ.PQT_SITE ms      ON ms.SITE_ID       = m.SITE_ID
    LEFT JOIN PRQ.PQT_MEETING_STATUS mst ON mst.STATUS_ID = m.STATUS_ID
WHERE l.PE_NUMBER = :peNumber
ORDER BY m.MEETING_DATE, mp.POINT_ORDER;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  11. DECISIONS per Point                                    │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== POINT DECISIONS ===' AS "Section",
    m.MEETING_ID              AS "Meeting ID",
    TO_CHAR(m.MEETING_DATE, 'DD/MM/YYYY HH24:MI') AS "Meeting Date",
    p.POINT_ID                AS "Point ID",
    p.REFERENCE               AS "Point Ref",
    p.TITLE                   AS "Point Title",
    pd.DECISION_ORDER         AS "Decision Order",
    d.DECISION_ID             AS "Decision ID",
    d.TITLE                   AS "Decision Title",
    d.LANGUAGE                AS "Decision Language",
    d.TEXT_LOB                AS "Decision Text"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_SD sd             ON sd.LETTER_ID     = l.LETTER_ID
    JOIN PRQ.PQT_MEETING m         ON m.MEETING_ID     = sd.MEETING_ID
    JOIN PRQ.PQT_MEETING_POINT mp  ON mp.MEETING_ID    = m.MEETING_ID
    JOIN PRQ.PQT_POINT p           ON p.POINT_ID       = mp.POINT_ID
    JOIN PRQ.PQT_POINT_DECI pd     ON pd.POINT_ID      = p.POINT_ID
    JOIN PRQ.PQT_DECISION d        ON d.DECISION_ID    = pd.DECISION_ID
WHERE l.PE_NUMBER = :peNumber
ORDER BY m.MEETING_DATE, mp.POINT_ORDER, pd.DECISION_ORDER;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  12. OTHER SAISINES on same Meeting Points                  │
-- │      (shows what else is discussed at same points)          │
-- └─────────────────────────────────────────────────────────────┘
SELECT
    '=== OTHER SAISINES ON SAME MEETINGS ===' AS "Section",
    m.MEETING_ID              AS "Meeting ID",
    TO_CHAR(m.MEETING_DATE, 'DD/MM/YYYY HH24:MI') AS "Meeting Date",
    CASE WHEN sd2.SD_REPORTED = 1 THEN 'Yes' ELSE 'No' END AS "Reported",
    CASE WHEN sd2.SD_MODIFIED = 1 THEN 'Yes' ELSE 'No' END AS "Modified",
    CASE WHEN sd2.SD_STOCKED  = 1 THEN 'Yes' ELSE 'No' END AS "Stocked",
    l2.LETTER_ID              AS "Other Saisine ID",
    l2.PE_NUMBER              AS "Other PE Number",
    l2.ECH_NUMBER             AS "Other Ech Number",
    st2.STATUS_VALUE          AS "Other Status",
    l2.OBJECT_FR              AS "Other Object FR"
FROM PRQ.PQT_LETTER l
    JOIN PRQ.PQT_SD sd             ON sd.LETTER_ID  = l.LETTER_ID
    JOIN PRQ.PQT_MEETING m         ON m.MEETING_ID  = sd.MEETING_ID
    JOIN PRQ.PQT_SD sd2            ON sd2.MEETING_ID = m.MEETING_ID
                                  AND sd2.LETTER_ID != l.LETTER_ID
    JOIN PRQ.PQT_LETTER l2        ON l2.LETTER_ID   = sd2.LETTER_ID
    LEFT JOIN PRQ.PQT_STATUS st2  ON st2.STATUS_ID   = l2.STATUS_ID
WHERE l.PE_NUMBER = :peNumber
ORDER BY m.MEETING_DATE, l2.PE_NUMBER;



-- SQL*Plus
VARIABLE pe_number VARCHAR2(50)
EXEC :pe_number := 'PE-2024-001'
@EXPORT_SAISINE_UNION.sql

-- Or in SQL Developer / DBeaver, it will prompt for :pe_number


-- ================================================================
-- Pure SQL export of full Saisine data using UNION ALL
-- Replace :pe_number with the actual PE_NUMBER value
-- ================================================================
-- Usage:  Run in SQL*Plus / SQL Developer / DBeaver
--         Set :pe_number = 'PE-2024-001'  (or use substitution variable)
-- ================================================================

WITH saisine AS (
    SELECT LETTER_ID FROM PRQ.PQT_LETTER WHERE PE_NUMBER = :pe_number
)

-- ════════════════════════════════════════════════════════════
-- SECTION 1: MAIN SAISINE
-- ════════════════════════════════════════════════════════════
SELECT 1 AS sec, 0 AS sub1, 0 AS sub2, 0 AS sub3, 0 AS sub4,
       '═══════════════════════════════════════════════════' AS line
FROM dual
UNION ALL
SELECT 1, 0, 0, 0, 1,
       'SAISINE: ' || l.PE_NUMBER
FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
UNION ALL
SELECT 1, 0, 0, 0, 2,
       '═══════════════════════════════════════════════════'
FROM dual
UNION ALL
SELECT 1, 0, 0, 0, rn, line FROM (
    SELECT ROWNUM AS rn, line FROM (
        SELECT 'ID .................. ' || l.LETTER_ID AS line FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'PE Number ........... ' || l.PE_NUMBER FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Echeancier Nr ....... ' || l.ECH_NUMBER FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Letter Nr ........... ' || l.LETTER_NUMBER FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Old PE Number ....... ' || l.OLD_PENUM FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'GEDA Ref ............ ' || l.GEDA_REF FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Status .............. ' || st.STATUS_VALUE
          FROM PRQ.PQT_LETTER l LEFT JOIN PRQ.PQT_STATUS st ON st.STATUS_ID = l.STATUS_ID
         WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Type ................ ' || tp.LETTER_TYPE
          FROM PRQ.PQT_LETTER l LEFT JOIN PRQ.PQT_LETTER_TYPE tp ON tp.LETTER_TYPE_ID = l.LETTER_TYPE_ID
         WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Format .............. ' || fmt.LETTER_SUBTYPE
          FROM PRQ.PQT_LETTER l LEFT JOIN PRQ.PQT_LETTER_SUBTYPE fmt ON fmt.LETTER_SUBTYPE_ID = l.LETTER_SUBTYPE_ID
         WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Language ............ ' || lang.TEXT
          FROM PRQ.PQT_LETTER l LEFT JOIN PRQ.PQT_LANGUAGE lang ON lang.LANGUAGE = l.LANGUAGE
         WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Object FR ........... ' || l.OBJECT_FR FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Object EN ........... ' || l.OBJECT_EN FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Title Intra ......... ' || l.INTRA_OBJECT FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Comment ............. ' || l.TXT_COMMENT FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'External Sender ..... ' || l.EXT_SENDER FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'DG Responsable ...... ' || l.DG_RESPONSABLE FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Model Type .......... ' || l.MODELE_TYPE FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Rule Number ......... ' || l.RULE_NUM FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Pages ............... ' || l.PAGE_CNT FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Confidential ........ ' || CASE WHEN l.CONFIDENTIAL = 1 THEN 'Yes' ELSE 'No' END FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Has Annex ........... ' || CASE WHEN l.ANNEX = 1 THEN 'Yes' ELSE 'No' END FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Follow-Up ........... ' || CASE WHEN l.FOLLOW_UP_LETTER = 1 THEN 'Yes' ELSE 'No' END FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'From Backlog ........ ' || CASE WHEN l.SAISINE_FROM_BACKLOG = 1 THEN 'Yes' ELSE 'No' END FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Letter Date ......... ' || TO_CHAR(l.LETTER_DATE, 'DD/MM/YYYY HH24:MI') FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Received ............ ' || TO_CHAR(l.RECEIVED, 'DD/MM/YYYY HH24:MI') FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Delay ............... ' || TO_CHAR(l.DELAY, 'DD/MM/YYYY HH24:MI') FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Response Date ....... ' || TO_CHAR(l.RESPONSE_DATE, 'DD/MM/YYYY HH24:MI') FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Proposed Meeting .... ' || TO_CHAR(l.PROPOSED_MEET, 'DD/MM/YYYY HH24:MI') FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Decision Date ....... ' || TO_CHAR(l.DEC_DATE, 'DD/MM/YYYY HH24:MI') FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Transfer Date ....... ' || TO_CHAR(l.TRANSFERT_DATE_SAISINE, 'DD/MM/YYYY HH24:MI') FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Created By .......... ' || l.CREATION_USER || ' on ' || TO_CHAR(l.CREATION_DATE, 'DD/MM/YYYY HH24:MI') FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT 'Modified By ......... ' || l.MODIFICATION_USER || ' on ' || TO_CHAR(l.MODIFICATION_DATE, 'DD/MM/YYYY HH24:MI') FROM PRQ.PQT_LETTER l WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT '--- Organs & Working Groups ---' FROM dual
        UNION ALL
        SELECT 'Main Organ .......... ' || org.ABBREVIATION || ' - ' || org.NAME
          FROM PRQ.PQT_LETTER l LEFT JOIN PRQ.PQT_SERVICE org ON org.SERVICE_ID = l.SERVICE_ID
         WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT '1st Organ ........... ' || o1.ABBREVIATION || ' - ' || o1.NAME
          FROM PRQ.PQT_LETTER l LEFT JOIN PRQ.PQT_SERVICE o1 ON o1.SERVICE_ID = l.FIRST_ORGAN_ID
         WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT '2nd Organ ........... ' || o2.ABBREVIATION || ' - ' || o2.NAME
          FROM PRQ.PQT_LETTER l LEFT JOIN PRQ.PQT_SERVICE o2 ON o2.SERVICE_ID = l.SECOND_ORGAN_ID
         WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT '1st Working Group ... ' || wg1.NAME || ' (' || wg1.GROUP_NAME || ')'
          FROM PRQ.PQT_LETTER l LEFT JOIN PRQ.PQT_WORK_GROUP wg1 ON wg1.WORK_GROUP_ID = l.WORK_GROUP_ONE_ID
         WHERE l.PE_NUMBER = :pe_number
        UNION ALL
        SELECT '2nd Working Group ... ' || wg2.NAME || ' (' || wg2.GROUP_NAME || ')'
          FROM PRQ.PQT_LETTER l LEFT JOIN PRQ.PQT_WORK_GROUP wg2 ON wg2.WORK_GROUP_ID = l.WORK_GROUP_TWO_ID
         WHERE l.PE_NUMBER = :pe_number
    )
)

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 2: COURRIER NUMBERS
-- ════════════════════════════════════════════════════════════
SELECT 2, 0, 0, 0, 0,
       '--- Courrier Numbers ---'
FROM dual
UNION ALL
SELECT 2, ROWNUM, 0, 0, 0,
       '  * ' || cr.COURRIER_NBR
  FROM PRQ.PQT_LETTER_COURRIER cr, saisine s
 WHERE cr.LETTER_ID = s.LETTER_ID
 ORDER BY cr.COURRIER_NBR

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 3: GEDA SENDERS
-- ════════════════════════════════════════════════════════════
SELECT 3, 0, 0, 0, 0,
       '--- GEDA Senders (Internal) ---'
FROM dual
UNION ALL
SELECT 3, ge.ENTITY_ID, 0, 0, 0,
       '  [' || ge.ENTITY_ID || '] ' || ge.NAME
       || ' | Function: ' || ge.FUNCTION
       || ' | Org: ' || ge.ORGA_SERV_NAME
  FROM PRQ.PQT_SAISINE_GEDA sg
  JOIN PRQ.PQT_GEDA_ENTITY ge ON ge.ENTITY_ID = sg.ENTITY_ID
  JOIN saisine s ON s.LETTER_ID = sg.LETTER_ID

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 4: GEDA RECEIVERS
-- ════════════════════════════════════════════════════════════
SELECT 4, 0, 0, 0, 0,
       '--- GEDA Receivers (Internal) ---'
FROM dual
UNION ALL
SELECT 4, gr.ENTITY_ID, 0, 0, 0,
       '  [' || gr.ENTITY_ID || '] ' || gr.NAME
       || ' | Function: ' || gr.FUNCTION
       || ' | Org: ' || gr.ORGA_SERV_NAME
  FROM PRQ.PQT_SAISINE_GEDA_REC sgr
  JOIN PRQ.PQT_GEDA_ENTITY gr ON gr.ENTITY_ID = sgr.ENTITY_ID
  JOIN saisine s ON s.LETTER_ID = sgr.LETTER_ID

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 5: DOCUMENTS
-- ════════════════════════════════════════════════════════════
SELECT 5, 0, 0, 0, 0,
       '--- Documents ---'
FROM dual
UNION ALL
SELECT 5, doc.DOCUMENT_ID, 0, 0, rn, line
FROM (
    SELECT doc.DOCUMENT_ID, ROWNUM AS rn, line FROM (
        -- Header
        SELECT doc.DOCUMENT_ID, 1 AS ord,
               'DOCUMENT [' || doc.DOCUMENT_ID || ']' AS line
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 2,
               '  Name .............. ' || doc.NAME
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 3,
               '  Title ............. ' || doc.TITLE
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 4,
               '  Type .............. ' || dt.DOC_TYPE || ' (' || dt.DESCRIPTION || ')'
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          LEFT JOIN PRQ.PQT_DOCUMENT_TYPE dt ON dt.DOC_TYPE_ID = doc.DOC_TYPE_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 5,
               '  Language .......... ' || dlang.TEXT
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          LEFT JOIN PRQ.PQT_LANGUAGE dlang ON dlang.LANGUAGE = doc.LANGUAGE
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 6,
               '  Path .............. ' || doc.PATH
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 7,
               '  URL ............... ' || doc.URL
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 8,
               '  Version ........... ' || doc.VERSION
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 9,
               '  Confidential ...... ' || CASE WHEN doc.CONFIDENTIAL = 1 THEN 'Yes' ELSE 'No' END
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 10,
               '  Compendium Ver .... ' || doc.COMPENDIUM_VERSION
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 11,
               '  Decision Date ..... ' || TO_CHAR(doc.DECISION_DATE, 'DD/MM/YYYY')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, 12,
               '  Application Date .. ' || TO_CHAR(doc.APP_DATE, 'DD/MM/YYYY')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        ORDER BY doc.DOCUMENT_ID, ord
    ) doc
) doc

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 6: TRANSLATIONS (per document)
-- ════════════════════════════════════════════════════════════
SELECT 6, doc.DOCUMENT_ID, tr.ID, 0, rn, line
FROM (
    SELECT doc.DOCUMENT_ID, tr.ID, ROWNUM AS rn, line FROM (
        SELECT doc.DOCUMENT_ID, tr.ID, 1 AS ord,
               '    FDR [' || tr.ID || '] Nr: ' || tr.NUM_FDR AS line
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 2,
               '      Title ............ ' || tr.NOM_DOCUMENT
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 3,
               '      File ............. ' || tr.FILE_NAME
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 4,
               '      Status ........... ' || tr.STATUS
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 5,
               '      Confidential ..... ' || tr.CODE_CONF
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 6,
               '      Doc Type ......... ' || dt.DOC_TYPE
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          LEFT JOIN PRQ.PQT_DOCUMENT_TYPE dt ON dt.DOC_TYPE_ID = tr.DOCUMENT_TYPE
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 7,
               '      Organ ............ ' || org.ABBREVIATION || ' - ' || org.NAME
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          LEFT JOIN PRQ.PQT_SERVICE org ON org.SERVICE_ID = tr.SERVICE_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 8,
               '      Template ......... ' || tr.TEMPLATE
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 9,
               '      Owner ............ ' || tr.OWNER
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 10,
               '      Phone ............ ' || tr.TEL_RESPONSABLE
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 11,
               '      Recipient ........ ' || tr.DESTINATAIRE
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 12,
               '      Observation ...... ' || tr.OBSERVATION
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 13,
               '      Asked By ......... ' || tr.ASKED_BY
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 14,
               '      Meeting Site ..... ' || site.SITE_NAME
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          LEFT JOIN PRQ.PQT_SITE site ON site.SITE_ID = tr.LIEU_REUNION
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 15,
               '      Meeting Date ..... ' || TO_CHAR(tr.DATE_REUNION, 'DD/MM/YYYY HH24:MI')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 16,
               '      Edition Site ..... ' || esite.SITE_NAME
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          LEFT JOIN PRQ.PQT_SITE esite ON esite.SITE_ID = tr.CODE_DU_LIEU_EDITION
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 17,
               '      Deadline Trad .... ' || TO_CHAR(tr.DEADLINE_TRADUCTION, 'DD/MM/YYYY HH24:MI')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 18,
               '      Deadline Edition . ' || TO_CHAR(tr.DEADLINE_EDITION, 'DD/MM/YYYY HH24:MI')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 19,
               '      Deadline Prod .... ' || TO_CHAR(tr.DEADLINE_PRODUCTION, 'DD/MM/YYYY HH24:MI')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tr.ID, 20,
               '      Transmis ......... ' || TO_CHAR(tr.TRANSMIS, 'DD/MM/YYYY HH24:MI')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        ORDER BY doc.DOCUMENT_ID, tr.ID, ord
    ) doc
) doc

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 7: TRANSLATION LANGUAGES (per translation)
-- ════════════════════════════════════════════════════════════
SELECT 7, doc.DOCUMENT_ID, tlg.TRANSLATION_ID, 0, rn, line
FROM (
    SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, ROWNUM AS rn, line FROM (
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE AS lang_sort, 1 AS ord,
               '        LANG [' || tlg.LANGUAGE || '] ' || lref.TEXT AS line
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          LEFT JOIN PRQ.PQT_LANGUAGE lref ON lref.LANGUAGE = tlg.LANGUAGE
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 2,
               '          Pages ............. ' || tlg.NBR_PAGES
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 3,
               '          Duplication ....... ' || tlg.DUPLICATION
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 4,
               '          Original .......... ' || tlg.ORIGINAL
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 5,
               '          Translation ....... ' || tlg.TRANSLATION
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 6,
               '          Ended ............. ' || tlg.ENDED
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 7,
               '          Display ........... ' || CASE WHEN tlg.DISPLAY_TRAD = 1 THEN 'Yes' ELSE 'No' END
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 8,
               '          Translated File ... ' || tlg.TRANSLATED_FILE
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 9,
               '          File Path ......... ' || tlg.TRANS_FILE_PATH
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 10,
               '          File URL .......... ' || tlg.TRANS_FILE_URL
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 11,
               '          Deadline Trad ..... ' || TO_CHAR(tlg.DEADLINE_TRADUCTION, 'DD/MM/YYYY HH24:MI')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 12,
               '          Deadline Edition .. ' || TO_CHAR(tlg.DEADLINE_EDITION, 'DD/MM/YYYY HH24:MI')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT doc.DOCUMENT_ID, tlg.TRANSLATION_ID, tlg.LANGUAGE, 13,
               '          Received .......... ' || TO_CHAR(tlg.RECEIVED_TRAD, 'DD/MM/YYYY HH24:MI')
          FROM PRQ.PQT_SAISINE_DOCUMENT sd
          JOIN PRQ.PQT_DOCUMENT doc ON doc.DOCUMENT_ID = sd.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION tr ON tr.DOCUMENT_ID = doc.DOCUMENT_ID
          JOIN PRQ.PQT_TRANSLATION_LANGUAGE tlg ON tlg.TRANSLATION_ID = tr.ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        ORDER BY doc.DOCUMENT_ID, tlg.TRANSLATION_ID, lang_sort, ord
    ) tlg
) tlg

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 8: MEETINGS
-- ════════════════════════════════════════════════════════════
SELECT 8, 0, 0, 0, 0,
       '--- Meetings ---'
FROM dual
UNION ALL
SELECT 8, mt.MEETING_ID, 0, 0, rn, line
FROM (
    SELECT mt.MEETING_ID, ROWNUM AS rn, line FROM (
        SELECT mt.MEETING_ID, 1 AS ord,
               'MEETING [' || mt.MEETING_ID || ']' AS line
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, 2,
               '  Date .............. ' || TO_CHAR(mt.MEETING_DATE, 'DD/MM/YYYY HH24:MI')
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, 3,
               '  Organ ............. ' || mo.ABBREVIATION || ' - ' || mo.NAME
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          LEFT JOIN PRQ.PQT_SERVICE mo ON mo.SERVICE_ID = mt.SERVICE_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, 4,
               '  Site .............. ' || ms.SITE_NAME
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          LEFT JOIN PRQ.PQT_SITE ms ON ms.SITE_ID = mt.SITE_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, 5,
               '  Status ............ ' || mst.STATUS_VALUE
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          LEFT JOIN PRQ.PQT_MEETING_STATUS mst ON mst.STATUS_ID = mt.STATUS_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, 6,
               '  Comments .......... ' || mt.COMMENTS
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, 7,
               '  Reported .......... ' || CASE WHEN sd.SD_REPORTED = 1 THEN 'Yes' ELSE 'No' END
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, 8,
               '  Modified .......... ' || CASE WHEN sd.SD_MODIFIED = 1 THEN 'Yes' ELSE 'No' END
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, 9,
               '  Stocked ........... ' || CASE WHEN sd.SD_STOCKED = 1 THEN 'Yes' ELSE 'No' END
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        ORDER BY mt.MEETING_ID, ord
    ) mt
) mt

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 9: MEETING POINTS (per meeting)
-- ════════════════════════════════════════════════════════════
SELECT 9, mt.MEETING_ID, pt.POINT_ID, 0, rn, line
FROM (
    SELECT mt.MEETING_ID, pt.POINT_ID, ROWNUM AS rn, line FROM (
        SELECT mt.MEETING_ID, pt.POINT_ID, mp.POINT_ORDER, 1 AS ord,
               '    POINT [' || pt.POINT_ID || '] #' || mp.POINT_ORDER AS line
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN PRQ.PQT_MEETING_POINT mp ON mp.MEETING_ID = mt.MEETING_ID
          JOIN PRQ.PQT_POINT pt ON pt.POINT_ID = mp.POINT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, pt.POINT_ID, mp.POINT_ORDER, 2,
               '      Reference ....... ' || pt.REFERENCE
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN PRQ.PQT_MEETING_POINT mp ON mp.MEETING_ID = mt.MEETING_ID
          JOIN PRQ.PQT_POINT pt ON pt.POINT_ID = mp.POINT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, pt.POINT_ID, mp.POINT_ORDER, 3,
               '      Title ........... ' || pt.TITLE
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN PRQ.PQT_MEETING_POINT mp ON mp.MEETING_ID = mt.MEETING_ID
          JOIN PRQ.PQT_POINT pt ON pt.POINT_ID = mp.POINT_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        ORDER BY mt.MEETING_ID, POINT_ORDER, pt.POINT_ID, ord
    ) pt
) pt

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 10: POINT DECISIONS (per point per meeting)
-- ════════════════════════════════════════════════════════════
SELECT 10, mt.MEETING_ID, pt.POINT_ID, deci.DECISION_ID, rn, line
FROM (
    SELECT mt.MEETING_ID, pt.POINT_ID, deci.DECISION_ID, ROWNUM AS rn, line FROM (
        SELECT mt.MEETING_ID, pt.POINT_ID, deci.DECISION_ID, pd.DECISION_ORDER, 1 AS ord,
               '        DECISION [' || deci.DECISION_ID || '] #' || pd.DECISION_ORDER AS line
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN PRQ.PQT_MEETING_POINT mp ON mp.MEETING_ID = mt.MEETING_ID
          JOIN PRQ.PQT_POINT pt ON pt.POINT_ID = mp.POINT_ID
          JOIN PRQ.PQT_POINT_DECI pd ON pd.POINT_ID = pt.POINT_ID
          JOIN PRQ.PQT_DECISION deci ON deci.DECISION_ID = pd.DECISION_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, pt.POINT_ID, deci.DECISION_ID, pd.DECISION_ORDER, 2,
               '          Title ...... ' || deci.TITLE
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN PRQ.PQT_MEETING_POINT mp ON mp.MEETING_ID = mt.MEETING_ID
          JOIN PRQ.PQT_POINT pt ON pt.POINT_ID = mp.POINT_ID
          JOIN PRQ.PQT_POINT_DECI pd ON pd.POINT_ID = pt.POINT_ID
          JOIN PRQ.PQT_DECISION deci ON deci.DECISION_ID = pd.DECISION_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, pt.POINT_ID, deci.DECISION_ID, pd.DECISION_ORDER, 3,
               '          Language .... ' || deci.LANGUAGE
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN PRQ.PQT_MEETING_POINT mp ON mp.MEETING_ID = mt.MEETING_ID
          JOIN PRQ.PQT_POINT pt ON pt.POINT_ID = mp.POINT_ID
          JOIN PRQ.PQT_POINT_DECI pd ON pd.POINT_ID = pt.POINT_ID
          JOIN PRQ.PQT_DECISION deci ON deci.DECISION_ID = pd.DECISION_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        UNION ALL
        SELECT mt.MEETING_ID, pt.POINT_ID, deci.DECISION_ID, pd.DECISION_ORDER, 4,
               '          Text: ' || SUBSTR(deci.TEXT_LOB, 1, 3900)
          FROM PRQ.PQT_SD sd
          JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
          JOIN PRQ.PQT_MEETING_POINT mp ON mp.MEETING_ID = mt.MEETING_ID
          JOIN PRQ.PQT_POINT pt ON pt.POINT_ID = mp.POINT_ID
          JOIN PRQ.PQT_POINT_DECI pd ON pd.POINT_ID = pt.POINT_ID
          JOIN PRQ.PQT_DECISION deci ON deci.DECISION_ID = pd.DECISION_ID
          JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
        ORDER BY mt.MEETING_ID, pt.POINT_ID, DECISION_ORDER, deci.DECISION_ID, ord
    ) deci
) deci

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 11: OTHER SAISINES ON SAME MEETINGS
-- ════════════════════════════════════════════════════════════
SELECT 11, mt.MEETING_ID, 0, 0, 0,
       '  --- Other Saisines on Meeting [' || mt.MEETING_ID || '] ---'
  FROM PRQ.PQT_SD sd
  JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
  JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
UNION ALL
SELECT 11, sd2.MEETING_ID, l2.LETTER_ID, 0, 0,
       '    [' || l2.LETTER_ID || '] '
       || l2.PE_NUMBER || ' | Ech: ' || l2.ECH_NUMBER
       || ' | ' || st2.STATUS_VALUE
       || ' | ' || l2.OBJECT_FR
  FROM PRQ.PQT_SD sd
  JOIN PRQ.PQT_MEETING mt ON mt.MEETING_ID = sd.MEETING_ID
  JOIN PRQ.PQT_SD sd2 ON sd2.MEETING_ID = mt.MEETING_ID
  JOIN PRQ.PQT_LETTER l2 ON l2.LETTER_ID = sd2.LETTER_ID
  LEFT JOIN PRQ.PQT_STATUS st2 ON st2.STATUS_ID = l2.STATUS_ID
  JOIN saisine s ON s.LETTER_ID = sd.LETTER_ID
 WHERE sd2.LETTER_ID != s.LETTER_ID

UNION ALL

-- ════════════════════════════════════════════════════════════
-- SECTION 12: FOOTER
-- ════════════════════════════════════════════════════════════
SELECT 99, 0, 0, 0, 0,
       '═══════════════════════════════════════════════════'
FROM dual
UNION ALL
SELECT 99, 0, 0, 0, 1,
       'END OF EXPORT FOR: ' || :pe_number
FROM dual
UNION ALL
SELECT 99, 0, 0, 0, 2,
       '═══════════════════════════════════════════════════'
FROM dual

-- FINAL ORDERING: sec -> sub1 -> sub2 -> sub3 -> sub4
ORDER BY 1, 2, 3, 4, 5
;





