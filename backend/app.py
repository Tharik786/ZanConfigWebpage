from flask import Flask, request, jsonify, send_from_directory
import mysql.connector
from pathlib import Path
import traceback
import hashlib

app = Flask(__name__, static_folder=None)

# -----------------------------------
# DATABASE CONFIG
# -----------------------------------
DB = {
    "host": "localhost",
    "user": "root",
    "password": "tharik",
    "database": "zanconfig",
}


def connect():
    return mysql.connector.connect(**DB)


# -----------------------------------
# AUTO-CREATE TABLES (if not exist)
# -----------------------------------
def init_db():
    try:
        db = connect()
        cur = db.cursor()

        # clientappdetails
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS clientappdetails (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clientName VARCHAR(255) NOT NULL,
                defaultLanguage VARCHAR(50),
                listOfLanguage TEXT,
                defaultDisplayLanguage VARCHAR(50),
                listOfDisplayLanguage TEXT,
                headerLogo VARCHAR(255),
                poweredByLogo VARCHAR(255),
                menuColor VARCHAR(50),
                subMenuColor VARCHAR(50),
                textColor VARCHAR(50),
                mobileHeaderColor VARCHAR(50),
                mobileMenuBgColor VARCHAR(50),
                headerText VARCHAR(255),
                welcomeText VARCHAR(255),
                welcomeBody TEXT,
                alert VARCHAR(255),
                productLogo VARCHAR(255),
                homeBgColor VARCHAR(50),
                homeLauncherLogo VARCHAR(255)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )

        # client_details
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS client_details (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clientName VARCHAR(255) NOT NULL,
                baseClient VARCHAR(100),
                dbName VARCHAR(100),
                medianFlag INT DEFAULT 0,
                stateMaintainHours INT DEFAULT 0,
                recentAlertHours INT DEFAULT 0,
                notificationListHours INT DEFAULT 0,
                trashEnabled VARCHAR(45) DEFAULT '0',
                paperEnabled VARCHAR(45) DEFAULT '0',
                hvacEnabled VARCHAR(45) DEFAULT '0',
                waterFlowEnabled VARCHAR(45) DEFAULT '0',
                feedbackEnabled VARCHAR(45) DEFAULT '0'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )

        # notificationconfiguration
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS notificationconfiguration (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clientName VARCHAR(255) NOT NULL,
                push VARCHAR(45) DEFAULT '0',
                timeRestriction INT DEFAULT 0,
                weekendRestriction INT DEFAULT 0,
                alertInterval INT DEFAULT 0,
                janitorIssueInterval INT DEFAULT 0,
                maintenanceIssueInterval INT DEFAULT 0,
                feedbackDuplicateFilterInterval INT DEFAULT 0,
                feedbackFilterCount INT DEFAULT 0,
                deviceEmailFlag VARCHAR(45) DEFAULT '0',
                feedbackCombinedFlag VARCHAR(45) DEFAULT '0',
                feedbackEmailFlag VARCHAR(45) DEFAULT '0',
                feedbackTextFlag VARCHAR(45) DEFAULT '0'
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )

        db.commit()
        db.close()
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
#  PASSWORD HELPERS
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
            WHERE LOWER(username) = LOWER(%s)
               OR LOWER(email) = LOWER(%s)
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
    """Find user by username only."""
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT id, username, email, password_hash
            FROM users
            WHERE LOWER(username) = LOWER(%s)
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
    """
    Supports:
    - old plain text passwords
    - SHA-256 hashed passwords
    """
    if not user:
        return False

    stored = (user.get("password_hash") or "").strip()
    input_pw = (input_pw or "").strip()

    # 1. match old plaintext
    if input_pw == stored:
        return True

    # 2. sha256 match
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
        username = (data.get("username") or "").strip()
        password = (data.get("password") or "").strip()

        user = get_user(username)

        if not user or not check_password(password, user):
            return jsonify({"ok": False, "error": "Invalid username or password"}), 401

        return jsonify({
            "ok": True,
            "token": user["username"],
            "user": {
                "id": user["id"],
                "username": user["username"],
                "email": user["email"]
            }
        })
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

        if get_user(username) or get_user(email):
            return jsonify({"ok": False, "error": "User already exists"}), 400

        hashed = sha256(password)

        db = connect()
        cur = db.cursor()
        cur.execute(
            """
            INSERT INTO users (username, email, password_hash)
            VALUES (%s, %s, %s)
            """,
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
            """
            UPDATE users SET username=%s, email=%s WHERE id=%s
            """,
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

        db = connect()
        cur = db.cursor()
        cur.execute(
            "UPDATE users SET password_hash=%s WHERE id=%s",
            (sha256(new_pw), user["id"]),
        )
        db.commit()
        db.close()

        return jsonify({"ok": True, "message": "Password updated"})
    except Exception:
        traceback.print_exc()
        return jsonify({"ok": False, "error": "Failed"}), 500


# ======================================================================
#  CLIENT / CONFIG CRUD
# ======================================================================
@app.route("/api/clients", methods=["GET"])
def get_clients():
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT 
                c.*,
                d.dbName,
                n.push
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
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT
                d.id,
                c.id AS clientId,
                d.clientName,
                d.baseClient,
                d.dbName,
                d.medianFlag,
                d.stateMaintainHours,
                d.recentAlertHours,
                d.notificationListHours,
                d.trashEnabled,
                d.paperEnabled,
                d.hvacEnabled,
                d.waterFlowEnabled,
                d.feedbackEnabled
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
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT
                n.id,
                c.id AS clientId,
                n.clientName,
                n.push,
                n.timeRestriction,
                n.weekendRestriction,
                n.alertInterval,
                n.janitorIssueInterval,
                n.maintenanceIssueInterval,
                n.feedbackDuplicateFilterInterval,
                n.feedbackFilterCount,
                n.deviceEmailFlag,
                n.feedbackCombinedFlag,
                n.feedbackEmailFlag,
                n.feedbackTextFlag
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
    try:
        db = connect()
        cur = db.cursor(dictionary=True)
        cur.execute(
            """
            SELECT 
                c.*,
                d.dbName,
                n.push
            FROM clientappdetails c
            LEFT JOIN client_details d ON c.clientName = d.clientName
            LEFT JOIN notificationconfiguration n ON c.clientName = n.clientName
            WHERE c.id = %s
            """,
            (id,),
        )
        row = cur.fetchone()
        db.close()
        return jsonify(row if row else {})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/create-client", methods=["POST"])
def create_client():
    try:
        data = request.get_json(force=True)
        list_lang = data.get("listOfLanguage", "")
        list_disp = data.get("listOfDisplayLanguage", "")

        db = connect()
        cur = db.cursor()

        cur.execute(
            """
            INSERT INTO clientappdetails 
            (clientName, defaultLanguage, listOfLanguage,
             defaultDisplayLanguage, listOfDisplayLanguage,
             headerLogo, poweredByLogo, menuColor, subMenuColor,
             textColor, mobileHeaderColor, mobileMenuBgColor,
             headerText, welcomeText, welcomeBody, alert,
             productLogo, homeBgColor, homeLauncherLogo)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                data["clientName"],
                data["defaultLanguage"],
                list_lang,
                data["defaultDisplayLanguage"],
                list_disp,
                data["headerLogo"],
                data["poweredByLogo"],
                data["menuColor"],
                data["subMenuColor"],
                data["textColor"],
                data["mobileHeaderColor"],
                data["mobileMenuBgColor"],
                data["headerText"],
                data["welcomeText"],
                data["welcomeBody"],
                data["alert"],
                data["productLogo"],
                data["homeBgColor"],
                data["homeLauncherLogo"],
            ),
        )

        cur.execute(
            """
            INSERT INTO client_details (clientName, dbName)
            VALUES (%s, %s)
            """,
            (data["clientName"], data["dbName"]),
        )

        cur.execute(
            """
            INSERT INTO notificationconfiguration (clientName, push)
            VALUES (%s, %s)
            """,
            (data["clientName"], data["push"]),
        )

        db.commit()
        db.close()
        return jsonify({"ok": True, "message": "Client created successfully"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/update-client/<id>", methods=["PUT"])
def update_client_route(id):
    try:
        data = request.get_json(force=True)
        list_lang = data.get("listOfLanguage", "")
        list_disp = data.get("listOfDisplayLanguage", "")

        db = connect()
        cur = db.cursor()

        cur.execute(
            """
            UPDATE clientappdetails SET
                clientName=%s, defaultLanguage=%s, listOfLanguage=%s,
                defaultDisplayLanguage=%s, listOfDisplayLanguage=%s,
                headerLogo=%s, poweredByLogo=%s, menuColor=%s, subMenuColor=%s,
                textColor=%s, mobileHeaderColor=%s, mobileMenuBgColor=%s,
                headerText=%s, welcomeText=%s, welcomeBody=%s, alert=%s,
                productLogo=%s, homeBgColor=%s, homeLauncherLogo=%s
            WHERE id=%s
            """,
            (
                data["clientName"],
                data["defaultLanguage"],
                list_lang,
                data["defaultDisplayLanguage"],
                list_disp,
                data["headerLogo"],
                data["poweredByLogo"],
                data["menuColor"],
                data["subMenuColor"],
                data["textColor"],
                data["mobileHeaderColor"],
                data["mobileMenuBgColor"],
                data["headerText"],
                data["welcomeText"],
                data["welcomeBody"],
                data["alert"],
                data["productLogo"],
                data["homeBgColor"],
                data["homeLauncherLogo"],
                id,
            ),
        )

        cur.execute(
            """
            UPDATE client_details SET dbName=%s WHERE clientName=%s
            """,
            (data["dbName"], data["clientName"]),
        )

        cur.execute(
            """
            UPDATE notificationconfiguration SET push=%s WHERE clientName=%s
            """,
            (data["push"], data["clientName"]),
        )

        db.commit()
        db.close()

        return jsonify({"ok": True, "message": "Updated successfully"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500


@app.route("/api/delete-client/<id>", methods=["DELETE"])
def delete_client(id):
    try:
        db = connect()
        cur = db.cursor(dictionary=True)

        cur.execute("SELECT clientName FROM clientappdetails WHERE id=%s", (id,))
        row = cur.fetchone()

        if not row:
            db.close()
            return jsonify({"ok": False, "error": "Client not found"}), 404

        cn = row["clientName"]

        cur.execute("DELETE FROM client_details WHERE clientName=%s", (cn,))
        cur.execute("DELETE FROM notificationconfiguration WHERE clientName=%s", (cn,))
        cur.execute("DELETE FROM clientappdetails WHERE id=%s", (id,))

        db.commit()
        db.close()
        return jsonify({"ok": True, "message": "Deleted successfully"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"ok": False, "error": str(e)}), 500


# ======================================================================
#  REACT BUILD
# ======================================================================
BASE = Path(__file__).resolve().parent
DIST = BASE.parent / "frontend" / "dist"


@app.route("/")
def root():
    return send_from_directory(DIST, "index.html")


@app.route("/<path:p>")
def static_files(p):
    f = DIST / p
    if f.exists():
        return send_from_directory(DIST, p)
    return send_from_directory(DIST, "index.html")


if __name__ == "__main__":
    # auto-create tables before starting server
    init_db()
    app.run(port=5000, debug=True)
