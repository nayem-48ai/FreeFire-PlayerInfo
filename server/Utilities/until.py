import json
from google.protobuf.message import Message
from google.protobuf import json_format, message
from Crypto.Cipher import AES
from Configuration.AESConfiguration import MAIN_KEY, MAIN_IV

# Load accounts from JSON file
def load_accounts():
    try:
        with open('./Configuration/AccountConfiguration.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        raise Exception("AccountConfiguration.json file not found")
    except json.JSONDecodeError:
        raise Exception("Error parsing AccountConfiguration.json")

def pad(text: bytes) -> bytes:
    padding_length = AES.block_size - (len(text) % AES.block_size)
    return text + bytes([padding_length] * padding_length)

def aes_cbc_encrypt(text: bytes) -> bytes:
    aes = AES.new(MAIN_KEY, AES.MODE_CBC, MAIN_IV)
    return aes.encrypt(pad(text))
    
def encode_protobuf(data: dict, proto_message: Message) -> bytes:
    """
    Utility function to convert dictionary/data to proto bytes
    
    Args:
        data (dict): Dictionary with proto data
        proto_message (Message): Proto message instance
    
    Returns:
        bytes: Serialized proto data
    
    Raises:
        ValueError: If input is invalid
        Exception: If proto conversion fails
    """
    if not isinstance(data, dict):
        raise ValueError("Data must be a dictionary")
    
    if not isinstance(proto_message, Message):
        raise ValueError("proto_message must be a protobuf Message")
    
    try:
        json_format.ParseDict(data, proto_message)
        return aes_cbc_encrypt(proto_message.SerializeToString())
    except Exception as e:
        raise Exception(f"Proto conversion failed: {str(e)}")

KEY_MAP = {
    "accountid": "accountId", "accounttype": "accountType", "nickname": "nickname",
    "externalid": "externalId", "clanname": "clanName", "rankingpoints": "rankingPoints",
    "haselitepass": "hasElitePass", "badgecnt": "badgeCnt", "badgeid": "badgeId",
    "seasonid": "seasonId", "lastloginat": "lastLoginAt", "externaluid": "externalUid",
    "returnat": "returnAt", "championshipteamname": "championshipTeamName",
    "csrank": "csRank", "csrankingpoints": "csRankingPoints", "weaponskinshows": "weaponSkinShows",
    "pinid": "pinId", "iscsrankingban": "isCsRankingBan", "maxrank": "maxRank",
    "csmaxrank": "csMaxRank", "maxrankingpoints": "maxRankingPoints",
    "gamebagshow": "gameBagShow", "peakrankpos": "peakRankPos",
    "cspeakrankpos": "csPeakRankPos", "accountprefers": "accountPrefers",
    "periodicrankingpoints": "periodicRankingPoints", "createat": "createAt",
    "veteranleavedaystag": "veteranLeaveDaysTag", "selecteditemslots": "selectedItemSlots",
    "preveterantype": "preVeteranType", "externaliconinfo": "externalIconInfo",
    "releaseversion": "releaseVersion", "veteranexpiretime": "veteranExpireTime",
    "showbrrank": "showBrRank", "showcsrank": "showCsRank", "clanbadgeid": "clanBadgeId",
    "customclanbadge": "customClanBadge", "usecustomclanbadge": "useCustomClanBadge",
    "clanframeid": "clanFrameId", "membershipstate": "membershipState",
    "selectoccupations": "selectOccupations", "itemtaginfo": "itemTagInfo",
    "ranksort": "rankSort", "csranksort": "csRankSort", "hipporank": "hippoRank",
    "hipporankingpoints": "hippoRankingPoints", "hippomaxrank": "hippoMaxRank",
    "showhipporank": "showHippoRank", "hippototalprofit": "hippoTotalProfit",
    "hippototalworth": "hippoTotalWorth", "modestatsinfos": "modeStatsInfos",
    "badgeinfo": "badgeInfo", "primeprivilegedetail": "primePrivilegeDetail",
    "cspeakpoints": "csPeakPoints", "displaycspeakpoint": "displayCsPeakPoint",
    "avatarframe": "avatarFrame", "avatarid": "avatarId", "skincolor": "skinColor",
    "equipedskills": "equipedSkills", "isselected": "isSelected",
    "pveprimaryweapon": "pvePrimaryWeapon", "isselectedawaken": "isSelectedAwaken",
    "endtime": "endTime", "unlocktype": "unlockType", "unlocktime": "unlockTime",
    "ismarkedstar": "isMarkedStar", "rankingleaderboardpos": "rankingLeaderboardPos",
    "historyepinfo": "historyEpInfo", "clanbasicinfo": "clanBasicInfo",
    "captainbasicinfo": "captainBasicInfo", "petinfo": "petInfo", "socialinfo": "socialInfo",
    "diamondcostres": "diamondCostRes", "creditscoreinfo": "creditScoreInfo",
    "modestatssummaryinfo": "modeStatsSummaryInfo", "mmrlist": "mmrList",
    "user_spark_info": "userSparkInfo", "collab_spark_info": "collabSparkInfo",
    "collection_custom_list": "collectionCustomList", "workshop_summary_info": "workshopSummaryInfo",
    "spark_info": "sparkInfo", "social_basic_info": "socialBasicInfo",
    "basicinfo": "basicInfo", "profileinfo": "profileInfo", "news": "news",
    "clanid": "clanId", "membernum": "memberNum", "capacity": "capacity",
    "clanlevel": "clanLevel", "credit_score": "creditScore", "rewardstate": "rewardState",
    "rewardtype": "rewardType",
}

def _transform_keys(obj):
    if isinstance(obj, dict):
        return {KEY_MAP.get(k, k): _transform_keys(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_transform_keys(i) for i in obj]
    return obj

def decode_protobuf(encoded_data: bytes, message_type: message.Message) -> dict:
    instance = message_type()
    instance.ParseFromString(encoded_data)
    return _transform_keys(json.loads(json_format.MessageToJson(instance)))
    