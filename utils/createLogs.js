const { getDate } = require("./getDate");

function getErrorCode(code) {
    const errorCode = {
        400: {
            "status": "Bad Request",
            "description": "一般的なクライアントエラー"
        },
        401: {
            "status": "Unauthorized",
            "description": "アクセス権が無い、または認証に失敗"
        },
        402: {
            "status": "Payment Required",
            "description": "料金の支払いをするまでリクエストを処理できない状態"
        },
        403: {
            "status": "Forbidden",
            "description": "閲覧権限が無いファイルやフォルダ"
        },
        404: {
            "status": "Not Found",
            "description": "Webページが見つからない"
        },
        405: {
            "status": "Method Not Allowed",
            "description": "送信するクライアント側のメソッドが許可されていない"
        },
        406: {
            "status": "Not Acceptable",
            "description": "サーバ側が受付不可能な値（ファイルの種類など）であり提供できない状態"
        },
        407: {
            "status": "Proxy Authentication Required",
            "description": "プロキシサーバ経由で通信を行う際にプロキシサーバの認証情報が不足している"
        },
        408: {
            "status": "Request Timeout",
            "description": "リクエスト送信後のやり取りに時間が長すぎるため時間切れ"
        },
        409: {
            "status": "Conflict",
            "description": "サーバに既に存在しているデータが競合しているためリクエストを完了できない"
        },
        410: {
            "status": "Gone",
            "description": "ファイルが削除されたため、ほぼ永久的にWebページが存在しない"
        },
        411: {
            "status": "Length Required",
            "description": "Content-Lengthとはリクエストヘッダに送るデータ容量が書いてある項目サーバの方でContent-Lengthヘッダが無いためアクセスを拒否した"
        },
        412: {
            "status": "Precondition Failed",
            "description": "ヘッダで定義された前提条件が満たされていない場合にアクセス拒否される"
        },
        413: {
            "status": "Payload Too Large",
            "description": "ファイルをアップロードする際にサーバで定めたファイル容量の上限を超えてしまった為アクセス拒否された"
        },
        414: {
            "status": "URI Too Long",
            "description": "指定したURLが長すぎる"
        },
        415: {
            "status": "Unsupported Media Type",
            "description": "サーバで許可していないリクエストの種類の為アクセス拒否された"
        },
        416: {
            "status": "Range Not Satisfiable",
            "description": "サーバーがリクエストされた範囲（容量）を提供できない"
        },
        417: {
            "status": "Expectation Failed",
            "description": "サーバが拡張されたステータスコードを返すことが出来ない"
        },
        422: {
            "status": "Unprocessable Entity",
            "description": "WebDAVの拡張ステータスコードリクエストは適正だが意味が異なるためサーバが返すことが出来ない"
        },
        423: {
            "status": "Locked",
            "description": "WebDAVの拡張ステータスコードリクエスト内容がロックされているためサーバが返すことが出来ない"
        },
        425: {
            "status": "Too Early",
            "description": "サーバが繰り返し処理が発生される可能性のあるリクエストと判断したため処理が出来ないと判断した※ 無限ループでサーバに高負荷がかかるリスクの可能性がある為"
        },
        426: {
            "status": "Upgrade Required",
            "description": "Upgrading to TLS Within HTTP/1.1の拡張ステータスコードHTTP/1.1にアップグレードが必要な為、サーバが処理できない"
        },
        429: {
            "status": "Too Many Requests",
            "description": "一定時間内にリクエスト数が多すぎるためアクセスを拒否した※ DDos攻撃によるサーバダウンのリスクを回避する為"
        },
        431: {
            "status": "Request Header Fields Too Large",
            "description": "リクエストヘッダーが長すぎるためサーバ処理が拒否した"
        },
        500: {
            "status": "Internal Server Error",
            "description": "何らかのサーバ内で起きたエラー"
        },
        501: {
            "status": "Not Implemented",
            "description": "サーバーがリクエストに満たすのに必要な機能をサポートしていない"
        },
        502: {
            "status": "Bad Gateway",
            "description": "ゲートウェイ・プロキシサーバが不正なリクエストを受け取り拒否した"
        },
        503: {
            "status": "Service Unavailable	",
            "description": "一時的にサーバにアクセスが出来ない"
        },
        504: {
            "status": "Gateway Timeout",
            "description": "リクエストを送ったサーバからの適切なレスポンスがなくタイムアウトした"
        },
        505: {
            "status": "HTTP Version Not Supported",
            "description": "HTTP バージョンがサーバによってサポートされていない"
        },
        506: {
            "status": "Variant Also Negotiates",
            "description": "Transparent Content Negotiation in HTTPで定義されている拡張ステータスコードURLを返すコンテンツで配置ミスなどによる内部サーバエラー"
        },
        507: {
            "status": "Insufficient Storage",
            "description": "WebDAV拡張ステータスコードサーバで処理するためのストレージ容量不足"
        },
        508: {
            "status": "Loop Detected",
            "description": "主に開発中のプログラム処理で、無限ループに陥ったためサーバーが操作を終了"
        },
        510: {
            "status": "Not Extended",
            "description": "主に静的ファイルへのアクセス集中による一時的に表示されるエラー"
        },
        511: {
            "status": "Network Authentication Required",
            "description": "ネットワーク認証が必要"
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