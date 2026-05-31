import sys, os, json, base64, hashlib, hmac, random, traceback
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from Crypto.Cipher import AES
from google.protobuf import json_format
from Proto.compiled.MajorLogin_pb2 import request as MLReq, response as MLRes
from Proto.compiled.PlayerPersonalShow_pb2 import request as PPSReq, response as PPSRes
from Proto.compiled.PlayerStats_pb2 import request as StatsReq, response as StatsRes
from Proto.compiled.PlayerCSStats_pb2 import request as CSStatsReq, response as CSStatsRes
from Utilities.until import encode_protobuf, decode_protobuf
from Configuration.APIConfiguration import RELEASEVERSION

app = Flask(__name__)
CORS(app)

ACCOUNTS = {
    "IND": {"uid": 4700643276, "password": "F899A3ED0A0869A0E8E2F8EDE2DFB845D0BE0B99C6898522F077DC5E8C51EF10"},
    "SG": {"uid": 4700643298, "password": "7331DA99639E0A83643373047534759BA37228A1571DB1E6AC9A11907C6307C1"},
    "BD": {"uid": 4700643735, "password": "A4C021D128BA47746CC54C1F62A1FB186F08F41DDA0731B7D5BC1C693AB26769"},
    "ID": {"uid": 4700643359, "password": "917E4D8D16CD46052041C3DDB55BD95C2247CDD86DDA135C9604C8AF40FAEAE8"},
    "US": {"uid": 4700643502, "password": "2C49F0B031ABBF0C8F8A815B9DE1BF3DAAC92F11594F457D3462212D3E4A21BC"},
    "VN": {"uid": 4700643587, "password": "04A90DB66D9864D0038782E24D7D2B9DB7B6679B207859AD17D4272B9C9F9B84"},
    "TH": {"uid": 4700643618, "password": "8E6DBF6E06946824BA9A98ACAE10FA106CC30318EB95756B0642FAB7AE6884B4"},
    "BR": {"uid": 4700643716, "password": "48F4557A85CFFBFAF063F58461E37AE386EAFF6F01AC4DBDC31B4B7C8009CCAF"},
}

SERVER_URL_MAP = {
    "client.us.freefiremobile.com": "US",
    "client.ind.freefiremobile.com": "IND",
}

OAUTH_URL = "https://ffmconnect.live.gop.garenanow.com/api/v2/oauth/guest/token:grant"
MAJOR_LOGIN_HOST = "loginbp.ggwhitehawk.com"
CLIENT_SECRET = "2ee44819e9b4598845141067b281621874d0d5d7af9d8f7e00c1e54715b7d1e3"
MAIN_KEY = b'Yg&tc%DEuh6%Zc^8'
MAIN_IV = b'6oyZDr22E3ychjM%'

account_cache = {}


def get_garena_token(uid, password):
    payload = {
        "client_id": 100067,
        "client_secret": CLIENT_SECRET,
        "client_type": 2,
        "password": password,
        "response_type": "token",
        "uid": int(uid),
    }
    r = requests.post(OAUTH_URL, json=payload, headers={
        "User-Agent": "GarenaMSDK/4.0.19P10(I2404 ;Android 15;en;US;)",
        "Content-Type": "application/json; charset=utf-8",
    }, timeout=15)
    if r.status_code != 200:
        return None
    return r.json().get("data")


def get_major_login(access_token, open_id):
    req = MLReq()
    req.openid = open_id
    req.openidtype = "4"
    req.logintoken = access_token
    req.platform = "4"

    encoded = req.SerializeToString()
    pad_len = 16 - (len(encoded) % 16)
    cipher = AES.new(MAIN_KEY, AES.MODE_CBC, MAIN_IV)
    encrypted = cipher.encrypt(encoded + bytes([pad_len]) * pad_len)

    for host in [MAJOR_LOGIN_HOST, "loginbp.ggpolarbear.com"]:
        try:
            r = requests.post(f"https://{host}/MajorLogin", data=encrypted, headers={
                "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; I2404 Build/AP3A.240905.015.A2_V000L1)",
                "Content-Type": "application/octet-stream",
                "X-Unity-Version": "2018.4.11f1",
                "X-GA": "v1 1",
                "ReleaseVersion": "OB51",
            }, timeout=15)
            if r.status_code == 200 and len(r.content) > 10:
                res = MLRes()
                res.ParseFromString(r.content)
                d = json.loads(json_format.MessageToJson(res))
                if d.get("token"):
                    return d
        except:
            continue
    return None


def authenticate(server):
    server = server.upper()
    if server not in ACCOUNTS:
        server = "BD"

    cache_key = f"{server}_{ACCOUNTS[server]['uid']}"
    if cache_key in account_cache:
        return account_cache[cache_key]

    result = get_garena_token(ACCOUNTS[server]["uid"], ACCOUNTS[server]["password"])
    if not result:
        return None

    login = get_major_login(result["access_token"], result["open_id"])
    if login:
        account_cache[cache_key] = login
        return login
    return None


def get_server_url(region, login_result):
    server_url = login_result.get("serverUrl", "")
    return server_url


def query_player_personal_show(server_url, token, account_id):
    encrypted = encode_protobuf({
        "accountId": account_id,
        "callSignSrc": 7,
        "needGalleryInfo": True,
        "needBlacklist": False,
        "needSparkInfo": False,
    }, PPSReq())

    r = requests.post(f"{server_url}/GetPlayerPersonalShow", data=encrypted, headers={
        "User-Agent": "UnityPlayer/2022.3.47f1 (UnityWebRequest/1.0, libcurl/8.5.0-DEV)",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Bearer {token}",
        "X-GA": "v1 1",
        "ReleaseVersion": RELEASEVERSION,
        "X-Unity-Version": "2022.3.47f1",
    }, timeout=30)

    if r.status_code != 200:
        return None, r.status_code, r.content[:200]

    res = PPSRes()
    res.ParseFromString(r.content)
    return json.loads(json_format.MessageToJson(res)), 200, None


@app.route("/")
def index():
    return jsonify({
        "status": "running",
        "version": "2.0",
        "endpoints": ["/get_player_personal_show", "/get_player_stats"],
    })


@app.route("/get_player_personal_show", methods=["GET"])
def handle_personal_show():
    try:
        server = request.args.get("server", "BD").upper()
        uid = request.args.get("uid")
        if not uid or not uid.isdigit():
            return jsonify({"status": "error", "error": "Invalid UID"}), 400

        auth = authenticate(server)
        if not auth:
            return jsonify({"status": "error", "error": "Authentication failed"}), 401

        data, status_code, err = query_player_personal_show(
            auth["serverUrl"], auth["token"], int(uid)
        )
        if status_code != 200:
            return jsonify({"status": "error", "error": err.decode() if err else f"HTTP {status_code}"}), status_code

        return jsonify(data)
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route("/get_player_stats", methods=["GET"])
def handle_player_stats():
    try:
        server = request.args.get("server", "BD").upper()
        uid = request.args.get("uid")
        gamemode = request.args.get("gamemode", "br").lower()
        matchmode = request.args.get("matchmode", "CAREER").upper()

        if not uid or not uid.isdigit():
            return jsonify({"success": False, "error": "Invalid UID"}), 400
        if gamemode not in ["br", "cs"]:
            return jsonify({"success": False, "error": "Invalid gamemode"}), 400
        if matchmode not in ["CAREER", "NORMAL", "RANKED"]:
            return jsonify({"success": False, "error": "Invalid matchmode"}), 400

        auth = authenticate(server)
        if not auth:
            return jsonify({"success": False, "error": "Authentication failed"}), 401

        server_url = auth["serverUrl"]
        token = auth["token"]
        uid_int = int(uid)

        if gamemode == "br":
            type_map = {"CAREER": 0, "NORMAL": 1, "RANKED": 2}
            url = f"{server_url}/GetPlayerStats"
            payload_data = {"accountid": uid_int, "matchmode": type_map[matchmode]}
            encrypted = encode_protobuf(payload_data, StatsReq())
        else:
            type_map = {"CAREER": 0, "NORMAL": 1, "RANKED": 6}
            url = f"{server_url}/GetPlayerTCStats"
            payload_data = {"accountid": uid_int, "gamemode": 15, "matchmode": type_map[matchmode]}
            encrypted = encode_protobuf(payload_data, CSStatsReq())

        r = requests.post(url, data=encrypted, headers={
            "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 13; A063 Build/TKQ1.221220.001)",
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": f"Bearer {token}",
            "X-Unity-Version": "2018.4.11f1",
            "X-GA": "v1 1",
            "ReleaseVersion": RELEASEVERSION,
        }, timeout=30)

        if r.status_code != 200:
            return jsonify({"success": False, "error": r.content[:200].decode()}), r.status_code

        data = decode_protobuf(r.content, StatsRes if gamemode == "br" else CSStatsRes)
        return jsonify({"success": True, "data": data, "metadata": {
            "server": server, "uid": uid, "gamemode": gamemode, "matchmode": matchmode,
        }})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
