const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

/*async function connectDB() {
    return new Promise(resolve => {
        console.log(`${getTime()}[${global.shardId}][INFO] Connecting to database on Shard ${global.shardId}.`);
        let connection = mysql.createPool({
            host: 'localhost',
            user: 'Skippie',
            password: '1@?qayWSX',
            database: 'soapbot'
        });
        connection.getConnection(function (err) {
            if (err) {
                console.log(`${getTime()}[${global.shardId}][ERROR] Could not connect to database on Shard ${global.shardId}. (${err})`)
                setTimeout(() => {
                    connectDB()
                }, 5000);
            } else {
                connection.on('error', (err) => {
                    console.log(`${getTime()}[${global.shardId}][ERROR] Database disconnected on Shard ${global.shardId}. (${err})`)
                    setTimeout(() => {
                        connectDB()
                    }, 5000);
                })
                global.db = connection;
                console.log(`${getTime()}[${global.shardId}][INFO] Connected to database on Shard ${global.shardId}.`);
                resolve();
            }
        });
    })
}*/


function getUTCDate(secondsToAdd = 0) {
    var today = new Date(Date.now() + secondsToAdd);
    //var date = today.getDate() + ". " + (today.getMonth() + 1) + ". " + today.getFullYear();
    var date = today.getUTCFullYear() + "-" + (today.getUTCMonth() + 1) + "-" + today.getUTCDate()
    var time = today.getUTCHours() + ":" + today.getUTCMinutes() + ":" + today.getUTCSeconds();
    var dateTime = date + ' ' + time;
    return dateTime;
}

function getTime() {
    var today = new Date();
    var date = today.getUTCDate() + ". " + (today.getUTCMonth() + 1) + ". " + today.getUTCFullYear();
    var time = today.getUTCHours() + ":" + today.getUTCMinutes() + ":" + today.getUTCSeconds();
    var dateTime = '[' + date + ' ' + time + ']';
    return dateTime;
}

var connection = mysql.createPool({
    connectionLimit: process.env.DB_LIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
    charset : 'utf8mb4_general_ci'
});

function SQL(str, params = []) {
    return new Promise((resolve) => {
        try {
            console.log(getTime() + `[${global.shardId}][SQL] ${str} - ${params}`);
            connection.getConnection(async (err, con) => {
                if (err) {
                    console.log(`${getTime()}[${global.shardId}][ERROR] Could not connect to database on Shard ${global.shardId}. (${err})`)
                    setTimeout(async () => {
                        resolve(await SQL(str, params))
                    }, 5000);
                } else {
                    const query = util.promisify(con.query).bind(con);
                    result = await query(str, params).catch((err) => {
                        console.log(`${getTime()}[${global.shardId}][ERROR] Database error on Shard ${global.shardId}. (${err})`)
                        setTimeout(async () => {
                            resolve(await SQL(str, params))
                        }, 5000);
                    })
                    con.release();
                    resolve(result);
                }
            });
        } catch (err) {
            console.log(`${getTime()}[${global.shardId}][ERROR] Database error on Shard ${global.shardId}. (${err})`)
            setTimeout(async () => {
                resolve(await SQL(str, params))
            }, 5000);
        }
    });

}


async function checkUserCreate(userID) {
    try {
        result = await SQL(`SELECT id FROM users WHERE user_id="${userID}"`)

        if (result.length <= 0) {
            await SQL(`INSERT INTO users (user_id) VALUES (?)`, [`${userID}`])
            return true;
        } else {
            return true;
        }
    } catch (err) {
        return err;
    }
}


async function getUserData(userID) {
    try {
        result = await SQL(`SELECT * FROM users WHERE user_id=?`, [userID])
        if (result.length <= 0) {
            return (false);
        }
        return (result[0]);
    } catch (err) {
        return (false);
    }
}

async function getPoints(userID) {
    try {
        result = await SQL(`SELECT points FROM users WHERE user_id=?`, [userID])
        if (result.length <= 0) {
            return (false);
        }
        return (result[0].points);
    } catch (err) {
        return (false);
    }
}

async function setPoints(userID, newPoints) {
    try {
        newPoints = await SQL(`UPDATE users SET points=${newPoints} WHERE user_id="${userID}"`);
        return (newPoints);
    } catch (err) {
        return (false);
    }
}

async function getSoapstatus(userID) {
    try {
        result = await SQL(`SELECT soap_status FROM users WHERE user_id=?`, [userID])
        if (result.length <= 0) {
            return (false);
        }
        return (result[0].soap_status);
    } catch (err) {
        return (false);
    }
}

async function setSoapstatus(userID, newStatus) {
    try {
        result = await SQL(`UPDATE users SET soap_status=${newStatus} WHERE user_id="${userID}"`);
        return (newStatus);
    } catch (err) {
        return (false);
    }
}

async function getPerms(userID) {
    try {
        result = await SQL(`SELECT permissions FROM users WHERE user_id=?`, [userID])
        if (result.length <= 0) {
            return (false);
        }
        return (result[0].permissions);
    } catch (err) {
        return (false);
    }
}

async function ban(userID, reason, adminID) {
    try {
        user = await getUserData(userID)
        if (!user) {
            return ("User not found.");
        }
        admin = await getUserData(adminID)

        if (!admin) {
            return ("Admin user not found.");
        }
        if (user.permissions >= admin.permissions) {
            return ("You don't have permissions to ban this user.");
        }
        if (reason)
            SQL(`INSERT INTO bans (reason, user_id, admin_id) VALUES (?, ?, ?)`, [reason, user.id, admin.id]);
        else
            SQL(`INSERT INTO bans (user_id, admin_id) VALUES (?, ?)`, [user.id, admin.id]);
        return (true);

    } catch (err) {
        return (false);
    }
}

async function checkBan(userID) {
    try {
        user = await getUserData(userID)
        if (!user) {
            return (false);
        }
        result = await SQL(`SELECT reason FROM bans WHERE user_id=${user.id}`, [])
        if (result.length > 0) {
            return (result[0].reason);
        } else {
            return (false);
        }
    } catch (err) {
        return (false);
    }
}

async function unban(userID) {
    try {
        user = await getUserData(userID)
        if (!user) {
            return (false);
        }
        result = await SQL(`DELETE FROM bans WHERE user_id=${user.id}`, [])
        if (result.affectedRows) {
            return (true);
        } else {
            return (false);
        }
    } catch (err) {
        return (false);
    }
}

async function getBank(userID) {
    try {
        result = await SQL(`SELECT stash, max_stash FROM users WHERE user_id=?`, [userID])
        if (result.length <= 0) {
            return (false);
        }
        return ([result[0].stash, result[0].max_stash]);
    } catch (err) {
        return (false);
    }
}

async function setBank(userID, newPoints) {
    try {
        newPoints = await SQL(`UPDATE users SET stash=${newPoints} WHERE user_id="${userID}"`);
        return (newPoints);
    } catch (err) {
        return (false);
    }
}

async function setMaxBank(userID, newPoints) {
    try {
        newPoints = await SQL(`UPDATE users SET max_stash=${newPoints} WHERE user_id="${userID}"`);
        return (newPoints);
    } catch (err) {
        return (false);
    }
}

async function getServerCount(client) {
    const req = await client.shard.fetchClientValues("guilds.cache.size");
    return req.reduce((p, n) => p + n, 0);
}

async function decodeNumber(WEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE) {
    wee = (WEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE.replace('k', '*1000*').replace('m', '*1000000*').replace('b', '*1000000000*').replace('t', '*1000000000000*'));
    wee = wee.replace("**", '*');
    wee = wee.split('*');
    weeeeeeeeeee = 1;
    wee.forEach(weeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee => {
        if (!isNaN(parseInt(weeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee))) {
            weeeeeeeeeee *= weeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
        } else {
            if (weeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee != "") {
                weeeeeeeeeee = NaN
                return false
            }
        }
    });
    if (isNaN(weeeeeeeeeee)) {
        weeeeeeeeeee = false
    }
    return weeeeeeeeeee;

}

async function getItemByName(name) {
    try {
        result = await SQL(`SELECT * FROM items WHERE item_name LIKE ?`, [`%${name}%`])
        if (result.length <= 0) {
            return (false);
        }
        return result[0];
    } catch (err) {
        return (false);
    }
}

async function updateAvatar(userID, avatarURL) {
    const user = await SQL("SELECT avatar_url FROM users WHERE user_id=?", [userID])
    if (user) {
        if (user[0].avatar_url != avatarURL) {
            await SQL("UPDATE users SET avatar_url=? WHERE user_id=?", [avatarURL, userID])
        }
    }
}

async function updateTag(userID, tag) {
    const user = await SQL("SELECT tag FROM users WHERE user_id=?", [userID])
    if (user) {
        if (user[0].tag != tag) {
            await SQL("UPDATE users SET tag=? WHERE user_id=?", [tag, userID])
        }
    }
}

module.exports = { updateAvatar, updateTag, getUTCDate, decodeNumber, getTime, SQL, getItemByName, checkUserCreate, getUserData, getPoints, setPoints, getBank, setBank, setMaxBank, getSoapstatus, setSoapstatus, getPerms, ban, checkBan, unban, getServerCount };