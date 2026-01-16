from flask import Flask, request, jsonify, send_from_directory
import mysql.connector
from pathlib import Path
import traceback
import hashlib
import os



app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "frontend" / "dist"

# =====================================================
# ENVIRONMENT
# =====================================================
APP_ENV = os.environ.get("APP_ENV", "prod").lower()

# =====================================================
# DATABASE CONFIGS
# =====================================================

PROD_DB = {
    "host": "10.7.0.23",
    "user": "tharik",
    "password": "Tharik#25",
    "port": 3306,
}

TEST_DB = {
    "host": "108.248.232.249",
    "user": "zanprduser",
    "password": "Insp!ron154",
    "database": "configpage",
    "port": 3306,
}

# =====================================================
# DB CONNECTION HELPERS
# =====================================================
def connect_prod():
    return mysql.connector.connect(**PROD_DB)

def connect_test():
    return mysql.connector.connect(**TEST_DB)

def connect_dashboard():
    if APP_ENV == "prod":
        return connect_prod()
    return connect_test()

def connect():
    try:
        return mysql.connector.connect(**TEST_DB)
    except mysql.connector.Error as e:
        print("Database connection failed")

# =====================================================
# UNION QUERY (SAFE VERSION)
# =====================================================
UNION_QUERY = """
SELECT
    'PHL' AS clientName,
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS currentTime,
    DATE_FORMAT((SELECT deviceTimestamp FROM phl.deviceStatus ORDER BY deviceTimestamp DESC LIMIT 1), '%Y-%m-%d %H:%i:%s') AS deviceStatusLastUpdated,
    DATE_FORMAT((SELECT updatedTime FROM phl.peoplecountanalytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s') AS peopleLastUpdated,
    DATE_FORMAT((SELECT updatedTime FROM phl.analytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s') AS analyticsLastUpdated,
    DATE_FORMAT(
        (SELECT updatedTime FROM flightDataHistory.{PHL_FLIGHT_TABLE}
         ORDER BY updatedTime DESC LIMIT 1),
        '%Y-%m-%d %H:%i:%s'
    ) AS flightLastUpdated,
    NULL AS trafficLastUpdated

UNION ALL

SELECT
    'PIT',
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT deviceTimestamp FROM pit.deviceStatus ORDER BY deviceTimestamp DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM pit.peoplecountanalytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM pit.analytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT(
        (SELECT updatedTime FROM flightDataHistory.{PIT_FLIGHT_TABLE}
         ORDER BY updatedTime DESC LIMIT 1),
        '%Y-%m-%d %H:%i:%s'
    ),
    NULL

UNION ALL

SELECT
    'APPLE',
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT deviceTimestamp FROM apple.deviceStatus ORDER BY deviceTimestamp DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM apple.peoplecountanalytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM apple.analytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    NULL,
    NULL

UNION ALL

SELECT
    'DIAL',
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT deviceTimestamp FROM dial.deviceStatus ORDER BY deviceTimestamp DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM dial.peoplecountanalytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM dial.analytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    NULL,
    NULL

UNION ALL

SELECT
    'TRAXMIA',
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT deviceTimestamp FROM traxmia.deviceStatus ORDER BY deviceTimestamp DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM traxmia.peoplecountanalytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM traxmia.analytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    NULL,
    NULL

UNION ALL

SELECT
    'TAKEDA',
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT deviceTimestamp FROM takeda.deviceStatus ORDER BY deviceTimestamp DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM takeda.peoplecountanalytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    DATE_FORMAT((SELECT updatedTime FROM takeda.analytics ORDER BY updatedTime DESC LIMIT 1), '%Y-%m-%d %H:%i:%s'),
    NULL,
    NULL

UNION ALL

SELECT
    'ABMMIA',
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'),
    NULL,
    NULL,
    NULL,
    NULL,
    DATE_FORMAT(
        (SELECT updatedTime FROM abmmia.intrafficDataAdvHistory
         ORDER BY updatedTime DESC LIMIT 1),
        '%Y-%m-%d %H:%i:%s'
    )

ORDER BY clientName;
"""


# ======================================================================
#  DEFAULT VALUES
# ======================================================================

DEFAULT_LANG_LIST = "English,German,Dutch"
DEFAULT_DISPLAY_LIST = "English"
DEFAULT_WELCOME_BODY = "WELCOME TO SEE MORE"


# ======================================================================
#  ALTER TABLE HELPERS
# ======================================================================

def alter_clientappdetails_defaults():
    """Apply defaults to clientappdetails without touching existing data."""
    try:
        db = connect()
        cur = db.cursor()

        alter_queries = [
            "ALTER TABLE clientappdetails MODIFY defaultLanguage VARCHAR(50) DEFAULT 'English';",
            "ALTER TABLE clientappdetails MODIFY defaultDisplayLanguage VARCHAR(50) DEFAULT 'English';",
            "ALTER TABLE clientappdetails MODIFY menuColor VARCHAR(50) DEFAULT '#141b4d';",
            "ALTER TABLE clientappdetails MODIFY subMenuColor VARCHAR(50) DEFAULT '272f69';",
            "ALTER TABLE clientappdetails MODIFY textColor VARCHAR(50) DEFAULT '#3d86ea';",
            "ALTER TABLE clientappdetails MODIFY headerText VARCHAR(255) DEFAULT 'Zanitor';",
            "ALTER TABLE clientappdetails MODIFY welcomeText VARCHAR(255) DEFAULT 'Welcome To Zanitor';",
        ]

        for q in alter_queries:
            try:
                cur.execute(q)
            except:
                pass

        # TEXT columns can't have DEFAULT in MySQL → update empty/null rows
        update_queries = [
            (
                "UPDATE clientappdetails SET welcomeBody=%s "
                "WHERE (welcomeBody IS NULL OR welcomeBody='');",
                (DEFAULT_WELCOME_BODY,),
            ),
            (
                "UPDATE clientappdetails SET listOfLanguage=%s "
                "WHERE (listOfLanguage IS NULL OR listOfLanguage='');",
                (DEFAULT_LANG_LIST,),
            ),
            (
                "UPDATE clientappdetails SET listOfDisplayLanguage=%s "
                "WHERE (listOfDisplayLanguage IS NULL OR listOfDisplayLanguage='');",
                (DEFAULT_DISPLAY_LIST,),
            ),
        ]

        for q, params in update_queries:
            try:
                cur.execute(q, params)
            except:
                pass

        db.commit()
        db.close()
        print("✔ clientappdetails defaults applied")

    except Exception as e:
        traceback.print_exc()
        print("Error in alter_clientappdetails_defaults:", str(e))


def alter_client_details_defaults():
    """Apply defaults to client_details (SAFE)."""
    try:
        db = connect()
        cur = db.cursor()

        alter_queries = [
            "ALTER TABLE client_details MODIFY medianFlag INT DEFAULT 0;",
            "ALTER TABLE client_details MODIFY stateMaintainHours INT DEFAULT 24;",
            "ALTER TABLE client_details MODIFY recentAlertHours INT DEFAULT 6;",
            "ALTER TABLE client_details MODIFY notificationListHours INT DEFAULT 24;",
            "ALTER TABLE client_details MODIFY trashEnabled VARCHAR(45) DEFAULT 'True';",
            "ALTER TABLE client_details MODIFY paperEnabled VARCHAR(45) DEFAULT 'True';",
            "ALTER TABLE client_details MODIFY hvacEnabled VARCHAR(45) DEFAULT 'False';",
            "ALTER TABLE client_details MODIFY waterFlowEnabled VARCHAR(45) DEFAULT 'True';",
            "ALTER TABLE client_details MODIFY feedbackEnabled VARCHAR(45) DEFAULT 'True';",
            "ALTER TABLE client_details MODIFY analyticsWeekEndRestrictionFlag VARCHAR(45) DEFAULT 'True';",
            "ALTER TABLE client_details MODIFY trafficSensor VARCHAR(45) DEFAULT 'PeopleCount';",
            "ALTER TABLE client_details MODIFY appViewType INT DEFAULT 1;",
        ]

        for q in alter_queries:
            try:
                cur.execute(q)
            except:
                pass

        db.commit()
        db.close()
        print("✔ client_details defaults applied")

    except Exception:
        traceback.print_exc()


def alter_notification_defaults():
    """Apply defaults to notificationconfiguration table."""
    try:
        db = connect()
        cur = db.cursor()

        alter_queries = [
            "ALTER TABLE notificationconfiguration MODIFY timeRestriction VARCHAR(50) DEFAULT '11:59 PM-12:01 AM';",
            "ALTER TABLE notificationconfiguration MODIFY weekendRestriction INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY alertInterval INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY janitorIssueInterval VARCHAR(10) DEFAULT '0,1';",
            "ALTER TABLE notificationconfiguration MODIFY maintenanceIssueInterval VARCHAR(10) DEFAULT '0,1';",
            "ALTER TABLE notificationconfiguration MODIFY feedbackDuplicateFilterInterval INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY feedbackFilterCount INT DEFAULT 4;",
            "ALTER TABLE notificationconfiguration MODIFY deviceEmailFlag VARCHAR(10) DEFAULT '0,0';",
            "ALTER TABLE notificationconfiguration MODIFY feedbackCombinedFlag VARCHAR(10) DEFAULT 'True';",
            "ALTER TABLE notificationconfiguration MODIFY feedbackEmailFlag VARCHAR(10) DEFAULT '0,0';",
            "ALTER TABLE notificationconfiguration MODIFY feedbackTextFlag INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY deviceTextFlag INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY qrJanitorpush VARCHAR(10) DEFAULT 'True';",
            "ALTER TABLE notificationconfiguration MODIFY qrJanitorTextFlag INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY qrJanitorEmailFlag INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY openAreaTrafficFlag INT DEFAULT 3;",
            "ALTER TABLE notificationconfiguration MODIFY escalationType INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY escalationLevel1Interval INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY escalationLevel2Interval INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY notCleanEscalationInterval INT DEFAULT 0;",
            "ALTER TABLE notificationconfiguration MODIFY cleaningScheduleFlag VARCHAR(10) DEFAULT 'False';",
            "ALTER TABLE notificationconfiguration MODIFY trafficAlert VARCHAR(10) DEFAULT 'True';",
        ]

        for q in alter_queries:
            try:
                cur.execute(q)
            except:
                pass

        db.commit()
        db.close()
        print("✔ notificationconfiguration defaults applied")

    except Exception:
        traceback.print_exc()


def alter_notification_numeric_columns_to_varchar():
    """
    Fix type of your 5 new columns so text input does NOT cause
    'Incorrect integer value' errors.
    """
    try:
        db = connect()
        cur = db.cursor()

        alter_queries = [
            "ALTER TABLE notificationconfiguration "
            "MODIFY deviceDataTimeInterval VARCHAR(500);",
            "ALTER TABLE notificationconfiguration "
            "MODIFY toiletPaperThreshold VARCHAR(400);",
            "ALTER TABLE notificationconfiguration "
            "MODIFY paperTowelThreshold VARCHAR(200);",
            "ALTER TABLE notificationconfiguration "
            "MODIFY trashThreshold VARCHAR(400);",
            "ALTER TABLE notificationconfiguration "
            "MODIFY areaAlertThreshold VARCHAR(300);",
        ]

        for q in alter_queries:
            try:
                cur.execute(q)
            except:
                # ignore if column doesn't exist / already VARCHAR
                pass

        db.commit()
        db.close()
        print("✔ notificationconfiguration numeric columns converted to VARCHAR")
    except Exception:
        traceback.print_exc()


def ensure_users_table():
    """Create minimal users table required by auth routes."""
    try:
        db = connect()
        cur = db.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )
        db.commit()
        db.close()
        print("✔ users table ensured")
    except Exception:
        traceback.print_exc()


def ensure_clientappdetails_columns(cur):
    """Add missing columns to clientappdetails without dropping data."""
    columns = [
        ("footerLogo", "ALTER TABLE clientappdetails ADD COLUMN footerLogo VARCHAR(255);"),
    ]
    for col, stmt in columns:
        try:
            cur.execute(stmt)
        except Exception:
            # ignore if column already exists
            pass


def ensure_client_details_columns(cur):
    """Add missing columns to client_details without dropping data."""
    alter_statements = [
        ("soapDispenserEnabled", "ALTER TABLE client_details ADD COLUMN soapDispenserEnabled VARCHAR(45) DEFAULT 'True';"),
        ("airFreshenerEnabled", "ALTER TABLE client_details ADD COLUMN airFreshenerEnabled VARCHAR(45) DEFAULT 'False';"),
        ("cleanIndexEnabled", "ALTER TABLE client_details ADD COLUMN cleanIndexEnabled VARCHAR(45) DEFAULT 'True';"),
        ("heatMapEnabled", "ALTER TABLE client_details ADD COLUMN heatMapEnabled VARCHAR(45) DEFAULT 'False';"),
        ("schedulerEnabled", "ALTER TABLE client_details ADD COLUMN schedulerEnabled VARCHAR(45) DEFAULT 'False';"),
        ("peopleCountEnabled", "ALTER TABLE client_details ADD COLUMN peopleCountEnabled VARCHAR(45) DEFAULT 'True';"),
        ("typicalHighValue", "ALTER TABLE client_details ADD COLUMN typicalHighValue INT DEFAULT 5;"),
        ("cleaningThreshold", "ALTER TABLE client_details ADD COLUMN cleaningThreshold INT DEFAULT 50;"),
        ("feedbackAlertConfig", "ALTER TABLE client_details ADD COLUMN feedbackAlertConfig VARCHAR(45) DEFAULT '0,1';"),
        ("beaconTimeInterval", "ALTER TABLE client_details ADD COLUMN beaconTimeInterval INT DEFAULT 2;"),
        ("soapShots", "ALTER TABLE client_details ADD COLUMN soapShots INT DEFAULT 1000;"),
        ("pumpPercentage", "ALTER TABLE client_details ADD COLUMN pumpPercentage INT DEFAULT 75;"),
        ("soapPredictionIsEnabled", "ALTER TABLE client_details ADD COLUMN soapPredictionIsEnabled VARCHAR(45) DEFAULT 'False';"),
        ("labelFlag", "ALTER TABLE client_details ADD COLUMN labelFlag VARCHAR(45) DEFAULT '3';"),
        ("weatherEnabled", "ALTER TABLE client_details ADD COLUMN weatherEnabled VARCHAR(45) DEFAULT 'False';"),
        ("language", "ALTER TABLE client_details ADD COLUMN language VARCHAR(45) DEFAULT 'English';"),
        ("occupancyDurationLimit", "ALTER TABLE client_details ADD COLUMN occupancyDurationLimit INT DEFAULT 10;"),
        ("passwordRotationInterval", "ALTER TABLE client_details ADD COLUMN passwordRotationInterval INT DEFAULT 0;"),
        ("mfaFlag", "ALTER TABLE client_details ADD COLUMN mfaFlag INT DEFAULT 0;"),
        ("pageReloadInterval", "ALTER TABLE client_details ADD COLUMN pageReloadInterval INT DEFAULT 60;"),
        ("inspectionType", "ALTER TABLE client_details ADD COLUMN inspectionType INT DEFAULT 1;"),
        ("defaultGradingflag", "ALTER TABLE client_details ADD COLUMN defaultGradingflag INT DEFAULT 1;"),
        ("commentsLimit", "ALTER TABLE client_details ADD COLUMN commentsLimit INT DEFAULT 100;"),
        ("janitorScheduleFlag", "ALTER TABLE client_details ADD COLUMN janitorScheduleFlag INT DEFAULT 0;"),
        ("publisherType", "ALTER TABLE client_details ADD COLUMN publisherType VARCHAR(45) DEFAULT 'mqtt';"),
        ("availableSensors", "ALTER TABLE client_details ADD COLUMN availableSensors VARCHAR(255) DEFAULT '';"),
        ("feedbackType", "ALTER TABLE client_details ADD COLUMN feedbackType INT DEFAULT 2;"),
        ("feedbackAlertOrder", "ALTER TABLE client_details ADD COLUMN feedbackAlertOrder INT DEFAULT 4;"),
        ("feedbackDefaultTimeout", "ALTER TABLE client_details ADD COLUMN feedbackDefaultTimeout INT DEFAULT 20;"),
        ("overViewStartTime", "ALTER TABLE client_details ADD COLUMN overViewStartTime VARCHAR(20) DEFAULT '12:00 AM';"),
        ("cannedChartPeriod", "ALTER TABLE client_details ADD COLUMN cannedChartPeriod INT DEFAULT 60;"),
        ("dataPostingType", "ALTER TABLE client_details ADD COLUMN dataPostingType VARCHAR(45) DEFAULT '';"),
    ]
    for col, stmt in alter_statements:
        try:
            cur.execute(stmt)
        except Exception as e:
            # Ignore errors for columns that already exist
            if "Duplicate column name" not in str(e):
                pass


def ensure_notification_threshold_columns(cur):
    """Add missing threshold columns to notificationconfiguration safely."""
    statements = [
        "ALTER TABLE notificationconfiguration ADD COLUMN deviceDataTimeInterval VARCHAR(500);",
        "ALTER TABLE notificationconfiguration ADD COLUMN toiletPaperThreshold VARCHAR(400);",
        "ALTER TABLE notificationconfiguration ADD COLUMN paperTowelThreshold VARCHAR(200);",
        "ALTER TABLE notificationconfiguration ADD COLUMN trashThreshold VARCHAR(400);",
        "ALTER TABLE notificationconfiguration ADD COLUMN areaAlertThreshold VARCHAR(300);",
    ]
    for stmt in statements:
        try:
            cur.execute(stmt)
        except Exception:
            # ignore if column already exists
            pass


def ensure_notification_extra_columns(cur):
    """Add missing columns to notificationconfiguration without dropping data."""
    try:
        cur.execute("ALTER TABLE notificationconfiguration ADD COLUMN dispatchedInterval INT DEFAULT 0;")
    except Exception:
        pass


# ======================================================================
#  AUTO-CREATE TABLES WITH DEFAULTS
# ======================================================================

def init_db():
    try:
        db = connect()
        cur = db.cursor()

        # -----------------------------------------------------
        # CLIENTAPPDETAILS TABLE
        # -----------------------------------------------------
        cur.execute("""
            CREATE TABLE IF NOT EXISTS clientappdetails (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clientName VARCHAR(255) NOT NULL,
                defaultLanguage VARCHAR(50) DEFAULT 'English',
                listOfLanguage TEXT,
                defaultDisplayLanguage VARCHAR(50) DEFAULT 'English',
                listOfDisplayLanguage TEXT,
                headerLogo VARCHAR(255),
                footerLogo VARCHAR(255),
                poweredByLogo VARCHAR(255),
                menuColor VARCHAR(50) DEFAULT '#141b4d',
                subMenuColor VARCHAR(50) DEFAULT '272f69',
                textColor VARCHAR(50) DEFAULT '#3d86ea',
                mobileHeaderColor VARCHAR(50),
                mobileMenuBgColor VARCHAR(50),
                headerText VARCHAR(255) DEFAULT 'Zanitor',
                welcomeText VARCHAR(255) DEFAULT 'Welcome To Zanitor',
                welcomeBody TEXT,
                productLogo VARCHAR(255),
                homeBgColor VARCHAR(50),
                homeLauncherLogo VARCHAR(255)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # -----------------------------------------------------
        # CLIENT_DETAILS TABLE
        # (minimal definition; your existing DB may have more)
        # -----------------------------------------------------
        cur.execute("""
            CREATE TABLE IF NOT EXISTS client_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clientName VARCHAR(255) NOT NULL,
                baseClient VARCHAR(100),
                dbName VARCHAR(100),
                medianFlag INT DEFAULT 0,
                stateMaintainHours INT DEFAULT 24,
                recentAlertHours INT DEFAULT 6,
                notificationListHours INT DEFAULT 24,
                trashEnabled VARCHAR(45) DEFAULT 'True',
                paperEnabled VARCHAR(45) DEFAULT 'True',
                hvacEnabled VARCHAR(45) DEFAULT 'False',
                waterFlowEnabled VARCHAR(45) DEFAULT 'True',
                feedbackEnabled VARCHAR(45) DEFAULT 'True',
                analyticsWeekEndRestrictionFlag VARCHAR(45) DEFAULT 'True',
                trafficSensor VARCHAR(45) DEFAULT 'PeopleCount',
                appViewType INT DEFAULT 1,
                soapDispenserEnabled VARCHAR(45) DEFAULT 'True',
                airFreshenerEnabled VARCHAR(45) DEFAULT 'False',
                cleanIndexEnabled VARCHAR(45) DEFAULT 'True',
                heatMapEnabled VARCHAR(45) DEFAULT 'False',
                schedulerEnabled VARCHAR(45) DEFAULT 'False',
                peopleCountEnabled VARCHAR(45) DEFAULT 'True',
                typicalHighValue INT DEFAULT 5,
                cleaningThreshold INT DEFAULT 50,
                feedbackAlertConfig VARCHAR(45) DEFAULT '0,1',
                beaconTimeInterval INT DEFAULT 2,
                soapShots INT DEFAULT 1000,
                pumpPercentage INT DEFAULT 75,
                soapPredictionIsEnabled VARCHAR(45) DEFAULT 'False',
                labelFlag VARCHAR(45) DEFAULT '3',
                weatherEnabled VARCHAR(45) DEFAULT 'False',
                language VARCHAR(45) DEFAULT 'English',
                occupancyDurationLimit INT DEFAULT 10,
                passwordRotationInterval INT DEFAULT 0,
                mfaFlag INT DEFAULT 0,
                pageReloadInterval INT DEFAULT 60,
                inspectionType INT DEFAULT 1,
                defaultGradingflag INT DEFAULT 1,
                commentsLimit INT DEFAULT 100,
                janitorScheduleFlag INT DEFAULT 0,
                publisherType VARCHAR(45) DEFAULT 'mqtt',
                availableSensors VARCHAR(255) DEFAULT '',
                feedbackType INT DEFAULT 2,
                feedbackAlertOrder INT DEFAULT 4,
                feedbackDefaultTimeout INT DEFAULT 20,
                overViewStartTime VARCHAR(20) DEFAULT '12:00 AM',
                cannedChartPeriod INT DEFAULT 60,
                dataPostingType VARCHAR(45) DEFAULT ''
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # -----------------------------------------------------
        # NOTIFICATIONCONFIGURATION TABLE
        # (core columns; new ones altered separately)
        # -----------------------------------------------------
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notificationconfiguration (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clientName VARCHAR(255) NOT NULL,
                push VARCHAR(10) DEFAULT 'True',
                timeRestriction VARCHAR(50) DEFAULT '11:59 PM-12:01 AM',
                weekendRestriction INT DEFAULT 0,
                alertInterval INT DEFAULT 0,
                janitorIssueInterval VARCHAR(10) DEFAULT '0,1',
                maintenanceIssueInterval VARCHAR(10) DEFAULT '0,1',
                feedbackDuplicateFilterInterval INT DEFAULT 0,
                feedbackFilterCount INT DEFAULT 4,
                deviceEmailFlag VARCHAR(10) DEFAULT '0,0',
                feedbackCombinedFlag VARCHAR(10) DEFAULT 'True',
                feedbackEmailFlag VARCHAR(10) DEFAULT '0,0',
                feedbackTextFlag INT DEFAULT 0,
                deviceTextFlag INT DEFAULT 0,
                qrJanitorpush VARCHAR(10) DEFAULT 'True',
                qrJanitorTextFlag INT DEFAULT 0,
                qrJanitorEmailFlag INT DEFAULT 0,
                openAreaTrafficFlag INT DEFAULT 3,
                escalationType INT DEFAULT 0,
                escalationLevel1Interval INT DEFAULT 0,
                escalationLevel2Interval INT DEFAULT 0,
                notCleanEscalationInterval INT DEFAULT 0,
                cleaningScheduleFlag VARCHAR(10) DEFAULT 'False',
                deviceDataTimeInterval VARCHAR(500),
                toiletPaperThreshold VARCHAR(400),
                paperTowelThreshold VARCHAR(200),
                trashThreshold VARCHAR(400),
                areaAlertThreshold VARCHAR(300),
                trafficAlert VARCHAR(10) DEFAULT 'True',
                dispatchedInterval INT DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # -----------------------------------------------------
        # USERS TABLE (for auth routes)
        # -----------------------------------------------------
        ensure_users_table()

        # Ensure older databases pick up newly added columns
        ensure_clientappdetails_columns(cur)
        ensure_client_details_columns(cur)
        ensure_notification_threshold_columns(cur)
        ensure_notification_extra_columns(cur)

        db.commit()
        db.close()

        # Run ALTER helpers
        alter_clientappdetails_defaults()
        alter_client_details_defaults()
        alter_notification_defaults()
        alter_notification_numeric_columns_to_varchar()

    except Exception:
        traceback.print_exc()


# -----------------------------------
# CORS
# -----------------------------------
@app.after_request
def cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return resp


@app.route("/api/<path:x>", methods=["OPTIONS"])
def opt(x):
    return ("", 204)


# ======================================================================
#  PASSWORD / USER HELPERS
# ======================================================================
def sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def get_user(login_name):
    """Case-insensitive username or email lookup."""
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT id, username, email, password_hash
            FROM users
            WHERE LOWER(username)=LOWER(%s)
               OR LOWER(email)=LOWER(%s)
            LIMIT 1
            """,
            (login_name, login_name),
        )
        row = cur.fetchone()
        db.close()
        return row
    except Exception:
        traceback.print_exc()
        return None


def get_user_by_username(username):
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT id, username, email, password_hash
            FROM users
            WHERE LOWER(username)=LOWER(%s)
            LIMIT 1
            """,
            (username,),
        )
        row = cur.fetchone()
        db.close()
        return row
    except Exception:
        traceback.print_exc()
        return None


def get_username_from_header():
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.split(" ", 1)[1].strip()
    return None


def get_current_user():
    username = get_username_from_header()
    if not username:
        return None
    return get_user_by_username(username)


def check_password(input_pw, user):
    if not user:
        return False
    stored = (user.get("password_hash") or "").strip()
    input_pw = (input_pw or "").strip()

    # Plaintext match
    if input_pw == stored:
        return True

    # SHA-256 match
    if sha256(input_pw) == stored:
        return True

    return False


# ======================================================================
#  AUTH ROUTES
# ======================================================================
@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()

        user = get_user(username)
        if not user or not check_password(password, user):
            return jsonify({"ok": False, "error": "Invalid username or password"}), 401

        return jsonify(
            {
                "ok": True,
                "token": user["username"],  # username used as Bearer token
                "user": {
                    "id": user["id"],
                    "username": user["username"],
                    "email": user["email"],
                },
            }
        )
    except Exception:
        traceback.print_exc()
        return jsonify({"ok": False, "error": "Login failed"}), 500


@app.route("/api/auth/register", methods=["POST"])
def register():
    try:
        data = request.get_json(force=True)
        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not username or not email or not password:
            return jsonify({"ok": False, "error": "All fields required"}), 400

        # Check existing
        if get_user(username) or get_user(email):
            return jsonify({"ok": False, "error": "User already exists"}), 400

        hashed = sha256(password)

        db = connect()
        cur = db.cursor()
        cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s,%s,%s)",
            (username, email, hashed),
        )
        db.commit()
        db.close()

        return jsonify({"ok": True, "message": "Account created successfully"})
    except Exception:
        traceback.print_exc()
        return jsonify({"ok": False, "error": "Registration failed"}), 500


@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    # Demo only – no email actually sent
    return jsonify({"ok": True, "message": "Reset link sent (demo only)"})


# ======================================================================
#  PROFILE
# ======================================================================
@app.route("/api/user/profile", methods=["GET"])
def profile():
    user = get_current_user()
    if not user:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    return jsonify({"ok": True, "user": user})


@app.route("/api/user/profile", methods=["PUT"])
def update_profile():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"ok": False, "error": "Unauthorized"}), 401

        data = request.get_json(force=True)
        new_username = data.get("username", user["username"]).strip()
        new_email = data.get("email", user["email"]).strip()

        db = connect()
        cur = db.cursor()
        cur.execute(
            "UPDATE users SET username=%s, email=%s WHERE id=%s",
            (new_username, new_email, user["id"]),
        )
        db.commit()
        db.close()

        updated = get_user_by_username(new_username)
        return jsonify({"ok": True, "user": updated})
    except Exception:
        traceback.print_exc()
        return jsonify({"ok": False, "error": "Update failed"}), 500


# ======================================================================
#  CHANGE PASSWORD
# ======================================================================
@app.route("/api/user/change-password", methods=["POST"])
def change_password():
    try:
        user = get_current_user()
        if not user:
            return jsonify({"ok": False, "error": "Unauthorized"}), 401

        data = request.get_json(force=True)
        old_pw = data.get("currentPassword", "")
        new_pw = data.get("newPassword", "")

        if not check_password(old_pw, user):
            return jsonify({"ok": False, "error": "Current password incorrect"}), 400

        hashed = sha256(new_pw)

        db = connect()
        cur = db.cursor()
        cur.execute(
            "UPDATE users SET password_hash=%s WHERE id=%s",
            (hashed, user["id"]),
        )
        db.commit()
        db.close()

        return jsonify({"ok": True, "message": "Password updated"})
    except Exception:
        traceback.print_exc()
        return jsonify({"ok": False, "error": "Failed"}), 500


# ======================================================================
#  BASIC CLIENT QUERIES
# ======================================================================
@app.route("/api/clients", methods=["GET"])
def get_clients():
    """
    List clients with:
      - all clientappdetails columns
      - dbName + baseClient (client_details)
      - push + 5 thresholds (notificationconfiguration)
    """
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT DISTINCT
                c.*,
                d.dbName,
                d.baseClient,
                n.push,
                n.deviceDataTimeInterval,
                n.toiletPaperThreshold,
                n.paperTowelThreshold,
                n.trashThreshold,
                n.areaAlertThreshold
            FROM clientappdetails c
            LEFT JOIN client_details d ON c.clientName = d.clientName
            LEFT JOIN notificationconfiguration n ON c.clientName = n.clientName
            ORDER BY c.id DESC
            """
        )
        rows = cur.fetchall()
        db.close()
        return jsonify(rows)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/client-details", methods=["GET"])
def get_client_details():
    """Raw client_details rows (+ clientId from clientappdetails)."""
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT d.*, c.id AS clientId
            FROM client_details d
            LEFT JOIN clientappdetails c ON c.clientName = d.clientName
            ORDER BY d.id DESC
            """
        )
        rows = cur.fetchall()
        db.close()
        return jsonify(rows)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/notification-configs", methods=["GET"])
def get_notification_configs():
    """Raw notificationconfiguration rows (+ clientId)."""
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT n.*, c.id AS clientId
            FROM notificationconfiguration n
            LEFT JOIN clientappdetails c ON c.clientName = n.clientName
            ORDER BY n.id DESC
            """
        )
        rows = cur.fetchall()
        db.close()
        return jsonify(rows)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/client/<id>", methods=["GET"])
def get_client(id):
    """
    Single client by id with:
      - clientappdetails columns
      - baseClient + dbName from client_details
      - push + 5 threshold fields from notificationconfiguration
    """
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT
                c.*,
                d.baseClient,
                d.dbName,
                n.push,
                n.deviceDataTimeInterval,
                n.toiletPaperThreshold,
                n.paperTowelThreshold,
                n.trashThreshold,
                n.areaAlertThreshold
            FROM clientappdetails c
            LEFT JOIN client_details d ON c.clientName = d.clientName
            LEFT JOIN notificationconfiguration n ON c.clientName = n.clientName
            WHERE c.id=%s
            """,
            (id,),
        )
        row = cur.fetchone()
        db.close()
        return jsonify(row if row else {})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ======================================================================
#  CLIENT CONFIG CRUD
# ======================================================================
@app.route("/api/create-client", methods=["POST"])
def create_client_route():
    """
    Create a client in all three tables:
      - clientappdetails
      - client_details
      - notificationconfiguration

    Uses BACKEND defaults when a value is missing.
    """
    try:
        data = request.get_json(force=True)

        client_name = (data.get("clientName") or "").strip()
        if not client_name:
            return jsonify({"ok": False, "error": "clientName is required"}), 400

        # FRONTEND may send either dbName or baseClient for DB
        base_client = (data.get("baseClient") or "").strip()
        db_name = (data.get("dbName") or base_client or "").strip()

        # BACKEND defaults for app config
        default_language = data.get("defaultLanguage") or "English"
        list_lang = data.get("listOfLanguage")
        if not list_lang:
            list_lang = DEFAULT_LANG_LIST

        default_display_language = data.get("defaultDisplayLanguage") or "English"
        list_disp = data.get("listOfDisplayLanguage")
        if not list_disp:
            list_disp = DEFAULT_DISPLAY_LIST

        menu_color = data.get("menuColor") or "#141b4d"
        sub_menu_color = data.get("subMenuColor") or "272f69"
        text_color = data.get("textColor") or "#3d86ea"

        header_text = data.get("headerText") or "Zanitor"
        welcome_text = data.get("welcomeText") or "Welcome To Zanitor"
        welcome_body = data.get("welcomeBody") or DEFAULT_WELCOME_BODY

        header_logo = data.get("headerLogo", "")
        powered_by_logo = data.get("poweredByLogo", "")
        footer_logo = data.get("footerLogo", "")
        mobile_header_color = data.get("mobileHeaderColor", "")
        mobile_menu_bg_color = data.get("mobileMenuBgColor", "")
        alert = data.get("alert", "")
        product_logo = data.get("productLogo", "")
        home_bg_color = data.get("homeBgColor", "")
        home_launcher_logo = data.get("homeLauncherLogo", "")

        push_val = data.get("push", "True")

        # Extended client_details fields
        soap_dispenser_enabled = data.get("soapDispenserEnabled", "True")
        air_freshener_enabled = data.get("airFreshenerEnabled", "False")
        clean_index_enabled = data.get("cleanIndexEnabled", "True")
        heat_map_enabled = data.get("heatMapEnabled", "False")
        scheduler_enabled = data.get("schedulerEnabled", "False")
        people_count_enabled = data.get("peopleCountEnabled", "True")
        typical_high_value = data.get("typicalHighValue", 5)
        cleaning_threshold = data.get("cleaningThreshold", 50)
        feedback_alert_config = data.get("feedbackAlertConfig", "0,1")
        beacon_time_interval = data.get("beaconTimeInterval", 2)
        soap_shots = data.get("soapShots", 1000)
        pump_percentage = data.get("pumpPercentage", 75)
        soap_prediction_enabled = data.get("soapPredictionIsEnabled", "False")
        label_flag = data.get("labelFlag", "3")
        weather_enabled = data.get("weatherEnabled", "False")
        language_val = data.get("language", "English")
        occupancy_duration_limit = data.get("occupancyDurationLimit", 10)
        password_rotation_interval = data.get("passwordRotationInterval", 0)
        mfa_flag = data.get("mfaFlag", 0)
        page_reload_interval = data.get("pageReloadInterval", 60)
        inspection_type = data.get("inspectionType", 1)
        default_grading_flag = data.get("defaultGradingflag", 1)
        comments_limit = data.get("commentsLimit", 100)
        janitor_schedule_flag = data.get("janitorScheduleFlag", 0)
        publisher_type = data.get("publisherType", "mqtt")
        available_sensors = data.get("availableSensors", "")
        feedback_type = data.get("feedbackType", 2)
        feedback_alert_order = data.get("feedbackAlertOrder", 4)
        feedback_default_timeout = data.get("feedbackDefaultTimeout", 20)
        overview_start_time = data.get("overViewStartTime", "12:00 AM")
        canned_chart_period = data.get("cannedChartPeriod", 60)
        data_posting_type = data.get("dataPostingType", "")

        # 5 NEW FIELDS – AddClient form → notificationconfiguration
        device_data_time_interval = data.get("deviceDataTimeInterval", "")
        toilet_paper_threshold = data.get("toiletPaperThreshold", "")
        paper_towel_threshold = data.get("paperTowelThreshold", "")
        trash_threshold = data.get("trashThreshold", "")
        area_alert_threshold = data.get("areaAlertThreshold", "")
        dispatched_interval = data.get("dispatchedInterval", 0)

        db = connect()
        cur = db.cursor()

        # 1) Insert into clientappdetails
        cur.execute(
            """
            INSERT INTO clientappdetails (
                clientName,
                defaultLanguage,
                listOfLanguage,
                defaultDisplayLanguage,
                listOfDisplayLanguage,
                headerLogo,
                footerLogo,
                poweredByLogo,
                menuColor,
                subMenuColor,
                textColor,
                mobileHeaderColor,
                mobileMenuBgColor,
                headerText,
                welcomeText,
                welcomeBody,
                productLogo,
                homeBgColor,
                homeLauncherLogo
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                client_name,
                default_language,
                list_lang,
                default_display_language,
                list_disp,
                header_logo,
                footer_logo,
                powered_by_logo,
                menu_color,
                sub_menu_color,
                text_color,
                mobile_header_color,
                mobile_menu_bg_color,
                header_text,
                welcome_text,
                welcome_body,
                product_logo,
                home_bg_color,
                home_launcher_logo,
            ),
        )

        # 2) Insert into client_details (store baseClient + dbName)
        cur.execute(
            """
            INSERT INTO client_details (
                clientName,
                baseClient,
                dbName,
                medianFlag,
                stateMaintainHours,
                recentAlertHours,
                notificationListHours,
                trashEnabled,
                paperEnabled,
                hvacEnabled,
                waterFlowEnabled,
                feedbackEnabled,
                analyticsWeekEndRestrictionFlag,
                trafficSensor,
                appViewType,
                soapDispenserEnabled,
                airFreshenerEnabled,
                cleanIndexEnabled,
                heatMapEnabled,
                schedulerEnabled,
                peopleCountEnabled,
                typicalHighValue,
                cleaningThreshold,
                feedbackAlertConfig,
                beaconTimeInterval,
                soapShots,
                pumpPercentage,
                soapPredictionIsEnabled,
                labelFlag,
                weatherEnabled,
                language,
                occupancyDurationLimit,
                passwordRotationInterval,
                mfaFlag,
                pageReloadInterval,
                inspectionType,
                defaultGradingflag,
                commentsLimit,
                janitorScheduleFlag,
                publisherType,
                availableSensors,
                feedbackType,
                feedbackAlertOrder,
                feedbackDefaultTimeout,
                overViewStartTime,
                cannedChartPeriod,
                dataPostingType
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                client_name,
                base_client,
                db_name,
                0,
                24,
                6,
                24,
                "True",
                "True",
                "False",
                "True",
                "True",
                "True",
                "PeopleCount",
                1,
                soap_dispenser_enabled,
                air_freshener_enabled,
                clean_index_enabled,
                heat_map_enabled,
                scheduler_enabled,
                people_count_enabled,
                typical_high_value,
                cleaning_threshold,
                feedback_alert_config,
                beacon_time_interval,
                soap_shots,
                pump_percentage,
                soap_prediction_enabled,
                label_flag,
                weather_enabled,
                language_val,
                occupancy_duration_limit,
                password_rotation_interval,
                mfa_flag,
                page_reload_interval,
                inspection_type,
                default_grading_flag,
                comments_limit,
                janitor_schedule_flag,
                publisher_type,
                available_sensors,
                feedback_type,
                feedback_alert_order,
                feedback_default_timeout,
                overview_start_time,
                canned_chart_period,
                data_posting_type,
            ),
        )

        # 3) Insert into notificationconfiguration (push + 5 new fields)
        cur.execute(
            """
            INSERT INTO notificationconfiguration (
                clientName,
                push,
                deviceDataTimeInterval,
                toiletPaperThreshold,
                paperTowelThreshold,
                trashThreshold,
                areaAlertThreshold,
                dispatchedInterval
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                client_name,
                push_val,
                device_data_time_interval,
                toilet_paper_threshold,
                paper_towel_threshold,
                trash_threshold,
                area_alert_threshold,
                dispatched_interval,
            ),
        )

        db.commit()
        db.close()

        return jsonify({"ok": True, "message": "Client created successfully"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/update-client/<id>", methods=["PUT"])
def update_client_route(id):
    """
    Update client in:
      - clientappdetails
      - client_details (baseClient + dbName)
      - notificationconfiguration (push + 5 new fields)
    """
    try:
        data = request.get_json(force=True)

        client_name = (data.get("clientName") or "").strip()
        if not client_name:
            return jsonify({"ok": False, "error": "clientName is required"}), 400

        base_client = (data.get("baseClient") or "").strip()
        db_name = (data.get("dbName") or base_client or "").strip()

        default_language = data.get("defaultLanguage") or "English"
        list_lang = data.get("listOfLanguage")
        if not list_lang:
            list_lang = DEFAULT_LANG_LIST

        default_display_language = data.get("defaultDisplayLanguage") or "English"
        list_disp = data.get("listOfDisplayLanguage")
        if not list_disp:
            list_disp = DEFAULT_DISPLAY_LIST

        menu_color = data.get("menuColor") or "#141b4d"
        sub_menu_color = data.get("subMenuColor") or "272f69"
        text_color = data.get("textColor") or "#3d86ea"

        header_text = data.get("headerText") or "Zanitor"
        welcome_text = data.get("welcomeText") or "Welcome To Zanitor"
        welcome_body = data.get("welcomeBody") or DEFAULT_WELCOME_BODY

        header_logo = data.get("headerLogo", "")
        powered_by_logo = data.get("poweredByLogo", "")
        mobile_header_color = data.get("mobileHeaderColor", "")
        mobile_menu_bg_color = data.get("mobileMenuBgColor", "")
        alert = data.get("alert", "")
        product_logo = data.get("productLogo", "")
        home_bg_color = data.get("homeBgColor", "")
        home_launcher_logo = data.get("homeLauncherLogo", "")

        push_val = data.get("push", "True")

        # Extended client_details fields
        soap_dispenser_enabled = data.get("soapDispenserEnabled", "True")
        air_freshener_enabled = data.get("airFreshenerEnabled", "False")
        clean_index_enabled = data.get("cleanIndexEnabled", "True")
        heat_map_enabled = data.get("heatMapEnabled", "False")
        scheduler_enabled = data.get("schedulerEnabled", "False")
        people_count_enabled = data.get("peopleCountEnabled", "True")
        typical_high_value = data.get("typicalHighValue", 5)
        cleaning_threshold = data.get("cleaningThreshold", 50)
        feedback_alert_config = data.get("feedbackAlertConfig", "0,1")
        beacon_time_interval = data.get("beaconTimeInterval", 2)
        soap_shots = data.get("soapShots", 1000)
        pump_percentage = data.get("pumpPercentage", 75)
        soap_prediction_enabled = data.get("soapPredictionIsEnabled", "False")
        label_flag = data.get("labelFlag", "3")
        weather_enabled = data.get("weatherEnabled", "False")
        language_val = data.get("language", "English")
        occupancy_duration_limit = data.get("occupancyDurationLimit", 10)
        password_rotation_interval = data.get("passwordRotationInterval", 0)
        mfa_flag = data.get("mfaFlag", 0)
        page_reload_interval = data.get("pageReloadInterval", 60)
        inspection_type = data.get("inspectionType", 1)
        default_grading_flag = data.get("defaultGradingflag", 1)
        comments_limit = data.get("commentsLimit", 100)
        janitor_schedule_flag = data.get("janitorScheduleFlag", 0)
        publisher_type = data.get("publisherType", "mqtt")
        available_sensors = data.get("availableSensors", "")
        feedback_type = data.get("feedbackType", 2)
        feedback_alert_order = data.get("feedbackAlertOrder", 4)
        feedback_default_timeout = data.get("feedbackDefaultTimeout", 20)
        overview_start_time = data.get("overViewStartTime", "12:00 AM")
        canned_chart_period = data.get("cannedChartPeriod", 60)
        data_posting_type = data.get("dataPostingType", "")

        # 5 new fields
        device_data_time_interval = data.get("deviceDataTimeInterval", "")
        toilet_paper_threshold = data.get("toiletPaperThreshold", "")
        paper_towel_threshold = data.get("paperTowelThreshold", "")
        trash_threshold = data.get("trashThreshold", "")
        area_alert_threshold = data.get("areaAlertThreshold", "")
        dispatched_interval = data.get("dispatchedInterval", 0)

        db = connect()
        cur = db.cursor()

        # 1) Update clientappdetails  (FIXED PARAM COUNT – removed alert=%s)
        cur.execute(
            """
            UPDATE clientappdetails SET
                clientName=%s,
                defaultLanguage=%s,
                listOfLanguage=%s,
                defaultDisplayLanguage=%s,
                listOfDisplayLanguage=%s,
                headerLogo=%s,
                poweredByLogo=%s,
                menuColor=%s,
                subMenuColor=%s,
                textColor=%s,
                mobileHeaderColor=%s,
                mobileMenuBgColor=%s,
                headerText=%s,
                welcomeText=%s,
                welcomeBody=%s,
                productLogo=%s,
                homeBgColor=%s,
                homeLauncherLogo=%s
            WHERE id=%s
            """,
            (
                client_name,
                default_language,
                list_lang,
                default_display_language,
                list_disp,
                header_logo,
                powered_by_logo,
                menu_color,
                sub_menu_color,
                text_color,
                mobile_header_color,
                mobile_menu_bg_color,
                header_text,
                welcome_text,
                welcome_body,
                product_logo,
                home_bg_color,
                home_launcher_logo,
                id,
            ),
        )

        # 2) Update client_details (baseClient + dbName)
        cur.execute(
            """
            UPDATE client_details
            SET baseClient=%s,
                dbName=%s,
                soapDispenserEnabled=%s,
                airFreshenerEnabled=%s,
                cleanIndexEnabled=%s,
                heatMapEnabled=%s,
                schedulerEnabled=%s,
                peopleCountEnabled=%s,
                typicalHighValue=%s,
                cleaningThreshold=%s,
                feedbackAlertConfig=%s,
                beaconTimeInterval=%s,
                soapShots=%s,
                pumpPercentage=%s,
                soapPredictionIsEnabled=%s,
                labelFlag=%s,
                weatherEnabled=%s,
                language=%s,
                occupancyDurationLimit=%s,
                passwordRotationInterval=%s,
                mfaFlag=%s,
                pageReloadInterval=%s,
                inspectionType=%s,
                defaultGradingflag=%s,
                commentsLimit=%s,
                janitorScheduleFlag=%s,
                publisherType=%s,
                availableSensors=%s,
                feedbackType=%s,
                feedbackAlertOrder=%s,
                feedbackDefaultTimeout=%s,
                overViewStartTime=%s,
                cannedChartPeriod=%s,
                dataPostingType=%s
            WHERE clientName=%s
            """,
            (
                base_client,
                db_name,
                soap_dispenser_enabled,
                air_freshener_enabled,
                clean_index_enabled,
                heat_map_enabled,
                scheduler_enabled,
                people_count_enabled,
                typical_high_value,
                cleaning_threshold,
                feedback_alert_config,
                beacon_time_interval,
                soap_shots,
                pump_percentage,
                soap_prediction_enabled,
                label_flag,
                weather_enabled,
                language_val,
                occupancy_duration_limit,
                password_rotation_interval,
                mfa_flag,
                page_reload_interval,
                inspection_type,
                default_grading_flag,
                comments_limit,
                janitor_schedule_flag,
                publisher_type,
                available_sensors,
                feedback_type,
                feedback_alert_order,
                feedback_default_timeout,
                overview_start_time,
                canned_chart_period,
                data_posting_type,
                client_name,
            ),
        )

        # 3) Update notificationconfiguration (push + 5 fields)
        cur.execute(
            """
            UPDATE notificationconfiguration
            SET
                push=%s,
                deviceDataTimeInterval=%s,
                toiletPaperThreshold=%s,
                paperTowelThreshold=%s,
                trashThreshold=%s,
                areaAlertThreshold=%s,
                dispatchedInterval=%s
            WHERE clientName=%s
            """,
            (
                push_val,
                device_data_time_interval,
                toilet_paper_threshold,
                paper_towel_threshold,
                trash_threshold,
                area_alert_threshold,
                dispatched_interval,
                client_name,
            ),
        )

        db.commit()
        db.close()

        return jsonify({"ok": True, "message": "Updated successfully"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/client-defaults", methods=["GET"])
def get_client_defaults():
    """
    Returns backend default values for AddClient page,
    grouped by the three tables so the frontend can
    fill all tabs easily.
    """
    try:
        # ------------ CLIENT_DETAILS DEFAULTS ------------
        client_details_defaults = {
            # shared ids (also present in other tables, but fine to send here too)
            "clientName": "",
            "dbName": "",

            "baseClient": "",
            "medianFlag": 0,
            "stateMaintainHours": 24,
            "recentAlertHours": 6,
            "notificationListHours": 24,

            "trashEnabled": "True",
            "paperEnabled": "True",
            "hvacEnabled": "False",
            "waterFlowEnabled": "True",
            "feedbackEnabled": "True",
            "soapDispenserEnabled": "True",
            "airFreshenerEnabled": "False",
            "cleanIndexEnabled": "True",
            "heatMapEnabled": "False",
            "schedulerEnabled": "False",
            "peopleCountEnabled": "True",

            "typicalHighValue": 5,
            "cleaningThreshold": 50,
            "analyticsWeekEndRestrictionFlag": "True",
            "trafficSensor": "PeopleCount",
            "appViewType": 1,
            "feedbackAlertConfig": "0,1",

            "beaconTimeInterval": 2,
            "soapShots": 1000,
            "pumpPercentage": 75,
            "soapPredictionIsEnabled": "False",
            "labelFlag": "3",
            "weatherEnabled": "False",

            "language": "English",  # UI language for this client
            "occupancyDurationLimit": 10,
            "passwordRotationInterval": 0,
            "mfaFlag": 0,
            "pageReloadInterval": 60,
            "inspectionType": 1,
            "defaultGradingflag": 1,
            "commentsLimit": 100,
            "janitorScheduleFlag": 0,
            "publisherType": "mqtt",
            "availableSensors": "",

            "feedbackType": 2,
            "feedbackAlertOrder": 4,
            "feedbackDefaultTimeout": 20,
            "overViewStartTime": "12:00 AM",
            "cannedChartPeriod": 60,
            "dataPostingType": "",
        }

        # ------------ CLIENT APP DETAILS DEFAULTS --------
        client_appdetails_defaults = {
            "defaultLanguage": "English",
            "listOfLanguage": DEFAULT_LANG_LIST,
            "defaultDisplayLanguage": "English",
            "listOfDisplayLanguage": DEFAULT_DISPLAY_LIST,

            "headerLogo": "https://zanelbapp.zancompute.com:82/ClientLogos/ANALYTICSPRD/ISS4.png",
            "footerLogo": "",
            "poweredByLogo": "https://zanelbapp.zancompute.com:82/ClientLogos/ANALYTICSPRD/Kiosk-Powered-by-1.png",
            "productLogo": "https://gcp-image.zancompute.com/ClientLogos/ANALYTICSPRD/Bobrick-BG-Ori.png",
            "homeLauncherLogo": "",

            "menuColor": "#141b4d",
            "subMenuColor": "272f69",
            "textColor": "#3d86ea",
            "mobileHeaderColor": "",
            "mobileMenuBgColor": "",
            "homeBgColor": "#f1fdff",

            "headerText": "Zanitor",
            "welcomeText": "Welcome To Zanitor",
            "welcomeBody": DEFAULT_WELCOME_BODY,
        }

        # ------------ NOTIFICATION CONFIG DEFAULTS -------
        notification_config_defaults = {
            "push": "True",
            "timeRestriction": "11:59 PM-12:01 AM",
            "weekendRestriction": 0,
            "alertInterval": 0,
            "janitorIssueInterval": "0,1",
            "maintenanceIssueInterval": "0,1",
            "feedbackDuplicateFilterInterval": 0,
            "feedbackFilterCount": 4,
            "deviceEmailFlag": "0,0",
            "feedbackCombinedFlag": "True",
            "feedbackEmailFlag": "0,0",
            "feedbackTextFlag": 0,
            "deviceTextFlag": 0,
            "qrJanitorpush": "True",
            "qrJanitorTextFlag": 0,
            "qrJanitorEmailFlag": 0,
            "openAreaTrafficFlag": 3,
            "escalationType": 0,
            "escalationLevel1Interval": 0,
            "escalationLevel2Interval": 0,
            "notCleanEscalationInterval": 0,
            "cleaningScheduleFlag": "False",
            "dispatchedInterval": 0,

            "deviceDataTimeInterval": "45",
            "toiletPaperThreshold": "15",
            "paperTowelThreshold": "15",
            "trashThreshold": "75",
            "areaAlertThreshold": "0",

            "trafficAlert": "True",
        }

        return jsonify(
            {
                "ok": True,
                "client_details": client_details_defaults,
                "client_appdetails": client_appdetails_defaults,
                "notification_config": notification_config_defaults,
            }
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/delete-client/<id>", methods=["DELETE"])
def delete_client_route(id):
    """
    Delete client from all three tables based on clientName.
    """
    try:
        db = connect()
        cur = db.cursor(dictionary=True)

        # Find clientName from clientappdetails
        cur.execute("SELECT clientName FROM clientappdetails WHERE id=%s", (id,))
        row = cur.fetchone()
        if not row:
            db.close()
            return jsonify({"ok": False, "error": "Client not found"}), 404

        cn = row["clientName"]

        # Delete from detail / notification / app
        cur.execute("DELETE FROM client_details WHERE clientName=%s", (cn,))
        cur.execute("DELETE FROM notificationconfiguration WHERE clientName=%s", (cn,))
        cur.execute("DELETE FROM clientappdetails WHERE id=%s", (id,))

        db.commit()
        db.close()

        return jsonify({"ok": True, "message": "Deleted successfully"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500

    
    # =====================================================
# API – HEALTH
# =====================================================
@app.route("/api/health")
def health():
    return jsonify({
        "ok": True,
        "env": APP_ENV,
        "db": "PROD_DB" if APP_ENV == "prod" else "TEST_DB"
    })

# =====================================================
# API – LAST UPDATED
# =====================================================
# @app.route("/api/lastupdated", methods=["GET"])
# def last_updated():
#     conn = None
#     cur = None
#     try:
#         if APP_ENV == "prod":
#             conn = connect_prod()
#         elif APP_ENV == "test":
#             conn = connect_test()
#         else:
#             return jsonify({"error": "Invalid APP_ENV"}), 500

#         cur = conn.cursor(dictionary=True)
#         cur.execute(UNION_QUERY)
#         rows = cur.fetchall()
#         return jsonify(rows), 200

#     except Exception as e:
#         traceback.print_exc()
#         return jsonify({
#             "error": "Failed to fetch data",
#             "details": str(e)
#         }), 500

#     finally:
#         if cur:
#             cur.close()
#         if conn:
#             conn.close()
@app.route("/api/lastupdated", methods=["GET"])
def last_updated():
    year = request.args.get("year")
    month = request.args.get("month")

    if not year or not month:
        return jsonify([]), 200

    month = str(month).zfill(2)

    phl_flight_table = f"phl_depHistory_{year}_{month}"
    pit_flight_table = f"pit_depHistory_{year}_{month}"

    query = UNION_QUERY.format(
        PHL_FLIGHT_TABLE=phl_flight_table,
        PIT_FLIGHT_TABLE=pit_flight_table,
    )

    try:
        conn = connect_dashboard()
        cur = conn.cursor(dictionary=True)
        cur.execute(query)
        rows = cur.fetchall()
        return jsonify(rows), 200

    except Exception as e:
        print("⚠ UNION ERROR:", e)
        return jsonify([]), 200

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


# =====================================================
# SERVE REACT BUILD
# =====================================================
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    if path.startswith("api/"):
        return jsonify({"error": "API route not found"}), 404

    file_path = DIST_DIR / path
    if path and file_path.exists():
        return send_from_directory(DIST_DIR, path)

    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        return send_from_directory(DIST_DIR, "index.html")

    return (
        "React build not found. "
        "Run `cd frontend && npm run build`.",
        500
    )

# =====================================================
# RUN SERVER
# =====================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
