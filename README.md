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
