const { getDate } = require("./getDate");

function getErrorCode(code) {
    const errorCode = {
        400: {
            "status": "Bad Request",
            "description": "リクエストの構文やパラメータが不正です。"
        },
        401: {
            "status": "Unauthorized",
            "description": "認証が必要です。または認証に失敗しました。"
        },
        402: {
            "status": "Payment Required",
            "description": "決済の完了、または支払いの手続きが必要です。"
        },
        403: {
            "status": "Forbidden",
            "description": "アクセス権限がないため、閲覧・操作が禁止されています。"
        },
        404: {
            "status": "Not Found",
            "description": "指定されたリソース（ページやファイル）が見つかりません。"
        },
        405: {
            "status": "Method Not Allowed",
            "description": "許可されていないHTTPメソッドが使用されました。"
        },
        406: {
            "status": "Not Acceptable",
            "description": "サーバ側が受け入れ可能な形式（Content-Type等）ではありません。"
        },
        407: {
            "status": "Proxy Authentication Required",
            "description": "プロキシサーバでの認証が必要です。"
        },
        408: {
            "status": "Request Timeout",
            "description": "リクエストの送信に時間がかかりすぎたため、タイムアウトしました。"
        },
        409: {
            "status": "Conflict",
            "description": "現在のサーバ状態と競合が発生したため、処理を完了できません。"
        },
        410: {
            "status": "Gone",
            "description": "リソースは恒久的に削除されており、存在しません。"
        },
        411: {
            "status": "Length Required",
            "description": "Content-Length ヘッダの指定が必要です。"
        },
        412: {
            "status": "Precondition Failed",
            "description": "リクエストヘッダで指定された前提条件が満たされていません。"
        },
        413: {
            "status": "Payload Too Large",
            "description": "リクエストデータ（ファイル等）の容量がサーバの上限を超えています。"
        },
        414: {
            "status": "URI Too Long",
            "description": "リクエストURLの長さがサーバの上限を超えています。"
        },
        415: {
            "status": "Unsupported Media Type",
            "description": "サポートされていないメディアタイプ（ファイル形式）です。"
        },
        416: {
            "status": "Range Not Satisfiable",
            "description": "リクエストされたデータの範囲を満たすことができません。"
        },
        417: {
            "status": "Expectation Failed",
            "description": "Expectヘッダによるサーバの期待に応えることができません。"
        },
        422: {
            "status": "Unprocessable Entity",
            "description": "構文は正しいですが、意味的なエラーのため処理できません。"
        },
        423: {
            "status": "Locked",
            "description": "アクセスしようとしたリソースはロックされています。"
        },
        425: {
            "status": "Too Early",
            "description": "リプレイ攻撃のリスクがあるため、早い段階での処理を拒否しました。"
        },
        426: {
            "status": "Upgrade Required",
            "description": "新しいプロトコル（TLSやHTTPバージョン）へのアップグレードが必要です。"
        },
        429: {
            "status": "Too Many Requests",
            "description": "リクエスト回数の制限を超えました。時間を空けて再試行してください。"
        },
        431: {
            "status": "Request Header Fields Too Large",
            "description": "リクエストヘッダのサイズがサーバの上限を超えています。"
        },
        500: {
            "status": "Internal Server Error",
            "description": "サーバ内部で予期しないエラーが発生しました。"
        },
        501: {
            "status": "Not Implemented",
            "description": "リクエストされた機能はサーバで実装されていません。"
        },
        502: {
            "status": "Bad Gateway",
            "description": "ゲートウェイまたはプロキシサーバが、上位サーバから不正な応答を受け取りました。"
        },
        503: {
            "status": "Service Unavailable	",
            "description": "サーバが一時的に過負荷、またはメンテナンス中です。"
        },
        504: {
            "status": "Gateway Timeout",
            "description": "ゲートウェイまたはプロキシサーバが、タイムアウト内に応答を受け取れませんでした。"
        },
        505: {
            "status": "HTTP Version Not Supported",
            "description": "リクエストされたHTTPバージョンはサポートされていません。"
        },
        506: {
            "status": "Variant Also Negotiates",
            "description": "サーバ内部のコンテンツネゴシエーション設定に誤りがあります。"
        },
        507: {
            "status": "Insufficient Storage",
            "description": "リクエストの処理に必要なストレージ容量がサーバに不足しています。"
        },
        508: {
            "status": "Loop Detected",
            "description": "サーバがリクエスト処理中に無限ループを検出しました。"
        },
        510: {
            "status": "Not Extended",
            "description": "リクエストを処理するために、ポリシーのさらなる拡張が必要です。"
        },
        511: {
            "status": "Network Authentication Required",
            "description": "ネットワークにアクセスするためには、事前の認証が必要です。"
        }

    }
    let error;
    if (code) {
        error = `${code} ${errorCode[code].status} (${errorCode[code].description})`;
    } else {
        error = "エラーコード: 不明"
    }
    return error;
}

const custom = {
    /**
     * 通常のログ出力
     * @param {any} content 
     */
    log: (content) => {
        console.log(`[${getDate()}]`, content);
    },

    /**
     * エラーログ出力
     * @param {any} content 
     * @param {string|number} code 
     */
    error: (content, code) => {
        console.error(`[${getDate()}]`, `${getErrorCode(code)}\n${content}`);
    }
};

global.custom = custom;