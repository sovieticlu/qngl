-- ============================================================
-- Get full Saisine details by PE_NUMBER with all relationships
-- All LEFT JOINs ensure no data is lost if relations are NULL
-- ============================================================

SELECT
    -- ── Saisine (main letter) ──────────────────────────────
    l.LETTER_ID                          AS "Saisine ID",
    l.PE_NUMBER                          AS "PE Number",
    l.ECH_NUMBER                         AS "Echeancier Number",
    l.LETTER_NUMBER                      AS "Letter Number",
    l.GEDA_REF                           AS "GEDA Reference",
    l.OBJECT_FR                          AS "Object (FR)",
    l.OBJECT_EN                          AS "Object (EN)",
    l.LETTER_DATE                        AS "Letter Date",
    l.RECEIVED                           AS "Received Date",
    l.DELAY                              AS "Delay Date",
    l.RESPONSE_DATE                      AS "Response Date",
    l.PROPOSED_MEET                      AS "Proposed Meeting",
    l.DEC_DATE                           AS "Decision Date",
    l.CONFIDENTIAL                       AS "Confidential",
    l.FOLLOW_UP_LETTER                   AS "Follow-Up Letter",
    l.DG_RESPONSABLE                     AS "DG Responsable",
    l.TRANSFERT_DATE_SAISINE             AS "Transfer Date to Saisine",
    l.PAGE_CNT                           AS "Number of Pages",
    l.ANNEX                              AS "Has Annex",
    l.INTRA_OBJECT                       AS "Title Intra",
    l.TXT_COMMENT                        AS "Comment",
    l.EXT_SENDER                         AS "External Sender",
    l.SAISINE_FROM_BACKLOG               AS "From Backlog",
    l.OLD_PENUM                          AS "Old PE Number",
    l.RULE_NUM                           AS "Rule Number",
    l.MODELE_TYPE                        AS "Model Type",
    l.CREATION_USER                      AS "Created By",
    l.CREATION_DATE                      AS "Created Date",
    l.MODIFICATION_USER                  AS "Modified By",
    l.MODIFICATION_DATE                  AS "Modified Date",

    -- ── Language ───────────────────────────────────────────
    lang.LANGUAGE                        AS "Language Code",
    lang.TEXT                            AS "Language Name",
    lang.UE                              AS "Language EU",

    -- ── Status ─────────────────────────────────────────────
    st.STATUS_ID                         AS "Status ID",
    st.STATUS_VALUE                      AS "Status",

    -- ── Type ───────────────────────────────────────────────
    tp.LETTER_TYPE_ID                    AS "Type ID",
    tp.LETTER_TYPE                       AS "Type",

    -- ── Format (Subtype) ──────────────────────────────────
    fmt.LETTER_SUBTYPE_ID               AS "Format ID",
    fmt.LETTER_SUBTYPE                  AS "Format",

    -- ── Organ (Service) ────────────────────────────────────
    org.SERVICE_ID                       AS "Organ ID",
    org.ABBREVIATION                     AS "Organ Abbr",
    org.NAME                             AS "Organ Name",
    org.SHORT_NAME                       AS "Organ Short Name",

    -- ── First Organ ────────────────────────────────────────
    o1.SERVICE_ID                        AS "1st Organ ID",
    o1.ABBREVIATION                      AS "1st Organ Abbr",
    o1.NAME                              AS "1st Organ Name",

    -- ── Second Organ ───────────────────────────────────────
    o2.SERVICE_ID                        AS "2nd Organ ID",
    o2.ABBREVIATION                      AS "2nd Organ Abbr",
    o2.NAME                              AS "2nd Organ Name",

    -- ── First Working Group ────────────────────────────────
    wg1.WORK_GROUP_ID                    AS "1st WorkGroup ID",
    wg1.NAME                             AS "1st WorkGroup Name",
    wg1.GROUP_NAME                       AS "1st WorkGroup Group",

    -- ── Second Working Group ───────────────────────────────
    wg2.WORK_GROUP_ID                    AS "2nd WorkGroup ID",
    wg2.NAME                             AS "2nd WorkGroup Name",
    wg2.GROUP_NAME                       AS "2nd WorkGroup Group",

    -- ── Documents ──────────────────────────────────────────
    doc.DOCUMENT_ID                      AS "Document ID",
    doc.NAME                             AS "Document Name",
    doc.TITLE                            AS "Document Title",
    doc.PATH                             AS "Document Path",
    doc.URL                              AS "Document URL",
    doc.VERSION                          AS "Document Version",
    doc.CONFIDENTIAL                     AS "Document Confidential",
    doc.COMPENDIUM_VERSION               AS "Compendium Version",

    -- ── Courrier Numbers ───────────────────────────────────
    cr.COURRIER_NBR                      AS "Courrier Number",

    -- ── GEDA Senders ──────────────────────────────────────
    gs.ENTITY_ID                         AS "Sender ID",
    gs.NAME                              AS "Sender Name",
    gs.FUNCTION                          AS "Sender Function",
    gs.ORGA_SERV_NAME                    AS "Sender Org Service",

    -- ── GEDA Receivers ─────────────────────────────────────
    gr.ENTITY_ID                         AS "Receiver ID",
    gr.NAME                              AS "Receiver Name",
    gr.FUNCTION                          AS "Receiver Function",
    gr.ORGA_SERV_NAME                    AS "Receiver Org Service",

    -- ── Meetings (via PQT_SD) ──────────────────────────────
    sd.SD_ID                             AS "Saisine-Meeting Link ID",
    sd.SD_REPORTED                       AS "Meeting Reported",
    sd.SD_MODIFIED                       AS "Meeting Modified",
    sd.SD_STOCKED                        AS "Meeting Stocked",
    m.MEETING_ID                         AS "Meeting ID",
    m.MEETING_DATE                       AS "Meeting Date",
    m.COMMENTS                           AS "Meeting Comments"

FROM
    PRQ.PQT_LETTER l

    -- Language
    LEFT JOIN PRQ.PQT_LANGUAGE lang
           ON lang.LANGUAGE = l.LANGUAGE

    -- Status
    LEFT JOIN PRQ.PQT_STATUS st
           ON st.STATUS_ID = l.STATUS_ID

    -- Type
    LEFT JOIN PRQ.PQT_LETTER_TYPE tp
           ON tp.LETTER_TYPE_ID = l.LETTER_TYPE_ID

    -- Format (subtype)
    LEFT JOIN PRQ.PQT_LETTER_SUBTYPE fmt
           ON fmt.LETTER_SUBTYPE_ID = l.LETTER_SUBTYPE_ID

    -- Organ (service)
    LEFT JOIN PRQ.PQT_SERVICE org
           ON org.SERVICE_ID = l.SERVICE_ID

    -- First Organ
    LEFT JOIN PRQ.PQT_SERVICE o1
           ON o1.SERVICE_ID = l.FIRST_ORGAN_ID

    -- Second Organ
    LEFT JOIN PRQ.PQT_SERVICE o2
           ON o2.SERVICE_ID = l.SECOND_ORGAN_ID

    -- First Working Group
    LEFT JOIN PRQ.PQT_WORK_GROUP wg1
           ON wg1.WORK_GROUP_ID = l.WORK_GROUP_ONE_ID

    -- Second Working Group
    LEFT JOIN PRQ.PQT_WORK_GROUP wg2
           ON wg2.WORK_GROUP_ID = l.WORK_GROUP_TWO_ID

    -- Documents (many-to-many)
    LEFT JOIN PRQ.PQT_SAISINE_DOCUMENT sd_doc
           ON sd_doc.LETTER_ID = l.LETTER_ID
    LEFT JOIN PRQ.PQT_DOCUMENT doc
           ON doc.DOCUMENT_ID = sd_doc.DOCUMENT_ID

    -- Courrier numbers (element collection)
    LEFT JOIN PRQ.PQT_LETTER_COURRIER cr
           ON cr.LETTER_ID = l.LETTER_ID

    -- GEDA Senders (many-to-many)
    LEFT JOIN PRQ.PQT_SAISINE_GEDA sg
           ON sg.LETTER_ID = l.LETTER_ID
    LEFT JOIN PRQ.PQT_GEDA_ENTITY gs
           ON gs.ENTITY_ID = sg.ENTITY_ID

    -- GEDA Receivers (many-to-many)
    LEFT JOIN PRQ.PQT_SAISINE_GEDA_REC sgr
           ON sgr.LETTER_ID = l.LETTER_ID
    LEFT JOIN PRQ.PQT_GEDA_ENTITY gr
           ON gr.ENTITY_ID = sgr.ENTITY_ID

    -- Saisine-Meeting links + Meeting
    LEFT JOIN PRQ.PQT_SD sd
           ON sd.LETTER_ID = l.LETTER_ID
    LEFT JOIN PRQ.PQT_MEETING m
           ON m.MEETING_ID = sd.MEETING_ID

WHERE
    l.PE_NUMBER = :peNumber          -- replace with actual value

ORDER BY
    l.LETTER_ID,
    doc.DOCUMENT_ID,
    gs.ENTITY_ID,
    gr.ENTITY_ID,
    m.MEETING_DATE;




-- ================================================================
-- Full Saisine by PE_NUMBER — all relationships, deep dependencies
-- All LEFT JOINs: nothing breaks if relations are NULL/missing
-- ================================================================

SELECT
    -- ── Saisine (PQT_LETTER) ──────────────────────────────
    l.LETTER_ID                          AS "Saisine ID",
    l.PE_NUMBER                          AS "PE Number",
    l.ECH_NUMBER                         AS "Echeancier Number",
    l.LETTER_NUMBER                      AS "Letter Number",
    l.GEDA_REF                           AS "GEDA Reference",
    l.OBJECT_FR                          AS "Object (FR)",
    l.OBJECT_EN                          AS "Object (EN)",
    l.LETTER_DATE                        AS "Letter Date",
    l.RECEIVED                           AS "Received Date",
    l.DELAY                              AS "Delay Date",
    l.RESPONSE_DATE                      AS "Response Date",
    l.PROPOSED_MEET                      AS "Proposed Meeting",
    l.DEC_DATE                           AS "Decision Date",
    l.CONFIDENTIAL                       AS "Confidential",
    l.FOLLOW_UP_LETTER                   AS "Follow-Up Letter",
    l.DG_RESPONSABLE                     AS "DG Responsable",
    l.TRANSFERT_DATE_SAISINE             AS "Transfer to Saisine",
    l.PAGE_CNT                           AS "Number of Pages",
    l.ANNEX                              AS "Has Annex",
    l.INTRA_OBJECT                       AS "Title Intra",
    l.TXT_COMMENT                        AS "Comment",
    l.EXT_SENDER                         AS "External Sender",
    l.SAISINE_FROM_BACKLOG               AS "From Backlog",
    l.OLD_PENUM                          AS "Old PE Number",
    l.RULE_NUM                           AS "Rule Number",
    l.MODELE_TYPE                        AS "Model Type",
    l.CREATION_USER                      AS "Created By",
    l.CREATION_DATE                      AS "Created Date",
    l.MODIFICATION_USER                  AS "Modified By",
    l.MODIFICATION_DATE                  AS "Modified Date",

    -- ── Language ───────────────────────────────────────────
    lang.LANGUAGE                        AS "Language Code",
    lang.TEXT                            AS "Language Name",

    -- ── Status ─────────────────────────────────────────────
    st.STATUS_ID                         AS "Status ID",
    st.STATUS_VALUE                      AS "Status",

    -- ── Type ───────────────────────────────────────────────
    tp.LETTER_TYPE_ID                    AS "Type ID",
    tp.LETTER_TYPE                       AS "Type",

    -- ── Format (Subtype) ──────────────────────────────────
    fmt.LETTER_SUBTYPE_ID               AS "Format ID",
    fmt.LETTER_SUBTYPE                  AS "Format",

    -- ── Organ (Service) ────────────────────────────────────
    org.SERVICE_ID                       AS "Organ ID",
    org.ABBREVIATION                     AS "Organ Abbr",
    org.NAME                             AS "Organ Name",

    -- ── First Organ ────────────────────────────────────────
    o1.SERVICE_ID                        AS "1st Organ ID",
    o1.ABBREVIATION                      AS "1st Organ Abbr",
    o1.NAME                              AS "1st Organ Name",

    -- ── Second Organ ───────────────────────────────────────
    o2.SERVICE_ID                        AS "2nd Organ ID",
    o2.ABBREVIATION                      AS "2nd Organ Abbr",
    o2.NAME                              AS "2nd Organ Name",

    -- ── First Working Group ────────────────────────────────
    wg1.WORK_GROUP_ID                    AS "1st WorkGroup ID",
    wg1.NAME                             AS "1st WorkGroup Name",
    wg1.GROUP_NAME                       AS "1st WorkGroup Group",

    -- ── Second Working Group ───────────────────────────────
    wg2.WORK_GROUP_ID                    AS "2nd WorkGroup ID",
    wg2.NAME                             AS "2nd WorkGroup Name",
    wg2.GROUP_NAME                       AS "2nd WorkGroup Group",

    -- ── Documents ──────────────────────────────────────────
    doc.DOCUMENT_ID                      AS "Doc ID",
    doc.NAME                             AS "Doc Name",
    doc.TITLE                            AS "Doc Title",
    doc.PATH                             AS "Doc Path",
    doc.URL                              AS "Doc URL",
    doc.VERSION                          AS "Doc Version",
    doc.CONFIDENTIAL                     AS "Doc Confidential",
    doc.COMPENDIUM_VERSION               AS "Doc Compendium Ver",
    doc.COMPENDIUM_REVISION              AS "Doc Revision Date",
    doc.DECISION_DATE                    AS "Doc Decision Date",
    doc.APP_DATE                         AS "Doc Application Date",

    -- ── Document Type ──────────────────────────────────────
    dt.DOC_TYPE_ID                       AS "DocType ID",
    dt.DOC_TYPE                          AS "DocType",
    dt.DESCRIPTION                       AS "DocType Desc",

    -- ── Document Language ──────────────────────────────────
    dlang.LANGUAGE                       AS "Doc Lang Code",
    dlang.TEXT                           AS "Doc Lang Name",

    -- ── Translations (FDR) ─────────────────────────────────
    tr.ID                                AS "Translation ID",
    tr.NUM_FDR                           AS "FDR Number",
    tr.NOM_DOCUMENT                      AS "Translation Title",
    tr.FILE_NAME                         AS "Translation File",
    tr.STATUS                            AS "Translation Status",
    tr.CODE_CONF                         AS "Translation Confidential",
    tr.TEMPLATE                          AS "Translation Template",
    tr.TEMPLATE_COMMENT                  AS "Template Comment",
    tr.OWNER                             AS "Template Owner",
    tr.TEL_RESPONSABLE                   AS "Translation Phone",
    tr.DESTINATAIRE                      AS "Translation Recipient",
    tr.OBSERVATION                       AS "Translation Observation",
    tr.MOTIF_REFUS                       AS "Why Refused",
    tr.DEADLINE_TRADUCTION               AS "FDR Deadline Trad",
    tr.DEADLINE_EDITION                  AS "FDR Deadline Edition",
    tr.DEADLINE_PRODUCTION               AS "FDR Deadline Prod",
    tr.TRANSMIS                          AS "FDR Transmis",
    tr.DATE_REUNION                      AS "FDR Meeting Date",
    tr.REF_AUTRE_DOCUMENTS               AS "FDR Other Doc Ref",
    tr.AUTRE_LANGUE_OR                   AS "FDR Other Orig Lang",
    tr.NBR_PAGES_AUTRE_LANGUE_OR         AS "FDR Other Lang Pages",
    tr.ASKED_BY                          AS "FDR Asked By",

    -- ── Translation → Organ (requester) ────────────────────
    tr_org.SERVICE_ID                    AS "FDR Organ ID",
    tr_org.ABBREVIATION                  AS "FDR Organ Abbr",
    tr_org.NAME                          AS "FDR Organ Name",

    -- ── Translation → Document Type ────────────────────────
    tr_dt.DOC_TYPE_ID                    AS "FDR DocType ID",
    tr_dt.DOC_TYPE                       AS "FDR DocType",

    -- ── Translation → Meeting Site ─────────────────────────
    tr_site.SITE_ID                      AS "FDR Site ID",
    tr_site.SITE_NAME                    AS "FDR Site Name",

    -- ── Translation → Edition Site ─────────────────────────
    tr_esite.SITE_ID                     AS "FDR Edition Site ID",
    tr_esite.SITE_NAME                   AS "FDR Edition Site",

    -- ── Translation Languages ──────────────────────────────
    tl.ID                                AS "TransLang ID",
    tl.LANGUAGE                          AS "TransLang Code",
    tl.NBR_PAGES                         AS "TransLang Pages",
    tl.DUPLICATION                       AS "TransLang Duplication",
    tl.ORIGINAL                          AS "TransLang Original",
    tl.TRANSLATION                       AS "TransLang Translation",
    tl.TRANSLATED_FILE                   AS "TransLang File",
    tl.TRANS_FILE_PATH                   AS "TransLang Path",
    tl.TRANS_FILE_URL                    AS "TransLang URL",
    tl.DEADLINE_TRADUCTION               AS "TransLang Deadline Trad",
    tl.DEADLINE_EDITION                  AS "TransLang Deadline Edit",
    tl.RECEIVED_TRAD                     AS "TransLang Received",
    tl.ENDED                             AS "TransLang Ended",
    tl.DISPLAY_TRAD                      AS "TransLang Display",

    -- ── Translation Language → Language name ────────────────
    tl_lang.TEXT                          AS "TransLang Name",

    -- ── Courrier Numbers ───────────────────────────────────
    cr.COURRIER_NBR                      AS "Courrier Number",

    -- ── GEDA Senders ──────────────────────────────────────
    gs.ENTITY_ID                         AS "Sender ID",
    gs.NAME                              AS "Sender Name",
    gs.FUNCTION                          AS "Sender Function",
    gs.ORGA_SERV_NAME                    AS "Sender Org Service",

    -- ── GEDA Receivers ─────────────────────────────────────
    gr.ENTITY_ID                         AS "Receiver ID",
    gr.NAME                              AS "Receiver Name",
    gr.FUNCTION                          AS "Receiver Function",
    gr.ORGA_SERV_NAME                    AS "Receiver Org Service",

    -- ── Meetings ───────────────────────────────────────────
    sd.SD_ID                             AS "Saisine-Meeting ID",
    sd.SD_REPORTED                       AS "Meeting Reported",
    sd.SD_MODIFIED                       AS "Meeting Modified",
    sd.SD_STOCKED                        AS "Meeting Stocked",
    m.MEETING_ID                         AS "Meeting ID",
    m.MEETING_DATE                       AS "Meeting Date",
    m.COMMENTS                           AS "Meeting Comments",

    -- ── Meeting → Site ─────────────────────────────────────
    ms.SITE_ID                           AS "Meeting Site ID",
    ms.SITE_NAME                         AS "Meeting Site Name",

    -- ── Meeting → Organ ────────────────────────────────────
    mo.SERVICE_ID                        AS "Meeting Organ ID",
    mo.ABBREVIATION                      AS "Meeting Organ Abbr",
    mo.NAME                              AS "Meeting Organ Name"

FROM
    PRQ.PQT_LETTER l

    -- Language
    LEFT JOIN PRQ.PQT_LANGUAGE lang       ON lang.LANGUAGE        = l.LANGUAGE

    -- Status
    LEFT JOIN PRQ.PQT_STATUS st           ON st.STATUS_ID         = l.STATUS_ID

    -- Type
    LEFT JOIN PRQ.PQT_LETTER_TYPE tp      ON tp.LETTER_TYPE_ID    = l.LETTER_TYPE_ID

    -- Format
    LEFT JOIN PRQ.PQT_LETTER_SUBTYPE fmt  ON fmt.LETTER_SUBTYPE_ID = l.LETTER_SUBTYPE_ID

    -- Organ
    LEFT JOIN PRQ.PQT_SERVICE org         ON org.SERVICE_ID       = l.SERVICE_ID

    -- First / Second Organ
    LEFT JOIN PRQ.PQT_SERVICE o1          ON o1.SERVICE_ID        = l.FIRST_ORGAN_ID
    LEFT JOIN PRQ.PQT_SERVICE o2          ON o2.SERVICE_ID        = l.SECOND_ORGAN_ID

    -- Working Groups
    LEFT JOIN PRQ.PQT_WORK_GROUP wg1      ON wg1.WORK_GROUP_ID   = l.WORK_GROUP_ONE_ID
    LEFT JOIN PRQ.PQT_WORK_GROUP wg2      ON wg2.WORK_GROUP_ID   = l.WORK_GROUP_TWO_ID

    -- Documents (many-to-many)
    LEFT JOIN PRQ.PQT_SAISINE_DOCUMENT sd_doc ON sd_doc.LETTER_ID = l.LETTER_ID
    LEFT JOIN PRQ.PQT_DOCUMENT doc        ON doc.DOCUMENT_ID      = sd_doc.DOCUMENT_ID

    -- Document → Type
    LEFT JOIN PRQ.PQT_DOCUMENT_TYPE dt    ON dt.DOC_TYPE_ID       = doc.DOC_TYPE_ID

    -- Document → Language
    LEFT JOIN PRQ.PQT_LANGUAGE dlang      ON dlang.LANGUAGE        = doc.LANGUAGE

    -- Document → Translations (FDR)
    LEFT JOIN PRQ.PQT_TRANSLATION tr      ON tr.DOCUMENT_ID       = doc.DOCUMENT_ID

    -- Translation → Organ (requester service)
    LEFT JOIN PRQ.PQT_SERVICE tr_org      ON tr_org.SERVICE_ID    = tr.SERVICE_ID

    -- Translation → Document Type
    LEFT JOIN PRQ.PQT_DOCUMENT_TYPE tr_dt ON tr_dt.DOC_TYPE_ID    = tr.DOCUMENT_TYPE

    -- Translation → Meeting Site
    LEFT JOIN PRQ.PQT_SITE tr_site        ON tr_site.SITE_ID      = tr.LIEU_REUNION

    -- Translation → Edition Site
    LEFT JOIN PRQ.PQT_SITE tr_esite       ON tr_esite.SITE_ID     = tr.CODE_DU_LIEU_EDITION

    -- Translation → Translation Languages
    LEFT JOIN PRQ.PQT_TRANSLATION_LANGUAGE tl ON tl.TRANSLATION_ID = tr.ID

    -- Translation Language → Language name lookup
    LEFT JOIN PRQ.PQT_LANGUAGE tl_lang    ON tl_lang.LANGUAGE      = tl.LANGUAGE

    -- Courrier numbers
    LEFT JOIN PRQ.PQT_LETTER_COURRIER cr  ON cr.LETTER_ID         = l.LETTER_ID

    -- GEDA Senders
    LEFT JOIN PRQ.PQT_SAISINE_GEDA sg    ON sg.LETTER_ID          = l.LETTER_ID
    LEFT JOIN PRQ.PQT_GEDA_ENTITY gs     ON gs.ENTITY_ID          = sg.ENTITY_ID

    -- GEDA Receivers
    LEFT JOIN PRQ.PQT_SAISINE_GEDA_REC sgr ON sgr.LETTER_ID       = l.LETTER_ID
    LEFT JOIN PRQ.PQT_GEDA_ENTITY gr     ON gr.ENTITY_ID          = sgr.ENTITY_ID

    -- Saisine ↔ Meeting
    LEFT JOIN PRQ.PQT_SD sd              ON sd.LETTER_ID           = l.LETTER_ID
    LEFT JOIN PRQ.PQT_MEETING m          ON m.MEETING_ID           = sd.MEETING_ID

    -- Meeting → Site
    LEFT JOIN PRQ.PQT_SITE ms            ON ms.SITE_ID             = m.SITE_ID

    -- Meeting → Organ
    LEFT JOIN PRQ.PQT_SERVICE mo         ON mo.SERVICE_ID          = m.SERVICE_ID

WHERE
    l.PE_NUMBER = :peNumber       -- replace with your value, e.g. 'PE-2024-001'

ORDER BY
    l.LETTER_ID,
    doc.DOCUMENT_ID,
    tr.ID,
    tl.LANGUAGE,
    m.MEETING_DATE;
    
