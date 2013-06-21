#!/usr/bin/python
# coding=utf-8


from .model import Model
import json

_tree = {'title' : u'全部顾客',
'nodes':[ 
{
    'title' : u'新顾客',
    'filter' : [0, 1],
    'nodes' : [
        {
            'title' : u'活跃新顾客',
            'filter' : [0,60],
  
            'nodes' :[
                {
                    'title' : u'重点发展',
                    'filter' : [0, 100]
                },
                {
                    'title' : u'高价值',
                    'filter' : [100, 999999999999999999]
                }
               
            ]
        },
        {
            'title' : u'睡眠顾客',
            'filter' : [60, 999999999999999999],
  
            'nodes' :[
                {
                    'title' : u'低价值',
                    'filter' : [0, 100]
                },
                {
                    'title' : u'一般价值',
                    'filter' : [100, 99999999999999999]
                }
            ]
        }
    ]
      
},
{
    'title' : u'老顾客',
    'filter' : [1, 99999999999999],
    'nodes' : [
        {
            'title' : u'活跃老顾客',
            'filter' : [0,60],
  
            'nodes' :[
                {
                    'title' : u'一般保持',
                    'filter' : [0, 100]
                },
                {
                    'title' : u'重点保持',
                    'filter' : [100, 999999999999999999]
                }
                
            ]
        },
        {
            'title' : u'睡眠回头客',
            'filter' : [60, 99999999999],
  
            'nodes' :[
                {
                    'title' : u'一般价值',
                    'filter' : [0, 100]
                },
                {
                    'title' : u'重点挽留',
                    'filter' : [100, 99999999999999999]
                }
            ]
        }
    ]
}
]
}


class User(Model):

    def __init__(self, uid, nick):
        Model.__init__(self)
        self.uid = uid
        self.nick = nick

    def update_classfify_tree(self, tree):
        query = "REPLACE INTO customer_classify (nick, classify_tree) VALUES(%s, %s)"
        Model.execute(query, self.nick, json.dumps(tree))
        
    def get_keywords(self):
        query = "SELECT keywords FROM customer_classify WHERE nick=%s"
        return Model.fetch_one(query, self.nick).keywords


    def update_keywords(self, keywords):
        query = "UPDATE customer_classify SET keywords=%s WHERE nick=%s"
        try:
            Model.execute(query, keywords, self.nick)
            return 1
        except:
            return -1

    def add_keyword(self, keyword):
        keywords = self.get_keywords()
        keywords = eval(keywords)
        for k in keywords:
            if k == keyword:
                return 0
        keywords.append(keyword)
        self.update_keywords(str(keywords))
        

    def del_keyword(self, keyword):
        keywords = self.get_keywords()
        keywords = set(eval(keywords))
        try:
            keywords.remove(keyword)
            if len(keywords) == 0:
                keywords = '[]'
            else:
                keywords = str(list(keywords))
            return self.update_keywords(keywords)
        except:
            return -1

    def get_customers(self):
        """在没有顾客的情况下返回None需要做异常处理"""
        query = "SELECT DISTINCT buyer_nick FROM trade WHERE seller_nick=%s"
        customers = Model.find_by_sql(query, self.nick)
        if len(customers) == 0:
            return None
        customers = ['"' + c.buyer_nick + '"' for c in customers]
        return','.join(customers)

    def get_loyalty_stst(self):
        keywords = self.get_kewywrods()
        customers = self.get_customers()
        customers = ','.join(customers)
        for keyword in keywords:
            user_ly = self.get_loyalty(keyword, customers)
            ly = self.get_sellers_loyalty(keyword, customers)

        query = """SELECT buyer_nick, seller_nick, title, COUNT(buyer_nick) buy_times, SUM(cost) costs
FROM customer_trade
WHERE  seller_nick=%s%s AND title REGEXP %%s  AND buyer_nick IN (%s)
GROUP BY seller_nick""" % (customers)
        return Model.fetch_one(query, self.nick, keyword)

    def get_sellers_loyalty(self, keyword, customers):
        query = """SELECT S.buyer_nick name,
CONCAT('http://i.taobao.com/', C.uid) as link,
SUM(S.cost) costs, COUNT(S.buyer_nick) buy_times,
SUM(IFNULL(T.cost, 0)) t_costs, SUM(IF(T.buyer_nick is NULL,0,  1)) t_buy_times,
ROUND(SUM(IFNULL(T.cost, 0))/SUM(S.cost), 2)  cost_percent,
ROUND(SUM(IF(T.buyer_nick is NULL,0,  1))/COUNT(S.buyer_nick), 2) btimes_percent
FROM
(SELECT buyer_nick, seller_nick, title, cost
FROM customer_trade
WHERE title REGEXP  '%s'
AND buyer_nick IN (%s)) S
LEFT JOIN
(SELECT buyer_nick, seller_nick, title, cost
FROM customer_trade
WHERE seller_nick=%%s AND title REGEXP '%s'
AND buyer_nick IN (%s)) T
ON (T.seller_nick=S.seller_nick)
LEFT JOIN customer C ON(C.nick = S.buyer_nick)
GROUP BY S.buyer_nick""" % (keyword, customers, keyword, customers)
        # logging.info(query, self.nick)
        return Model.find_by_sql(query, self.nick)

    def get_ly_costmoer_total_count(self, customers):
        query = 'SELECT COUNT(DISTINCT buyer_nick) ly_total  FROM trade WHERE seller_nick=%s'
        return Model.fetch_one(query, self.nick).ly_total

    def get_unly_customer_count(self, customers):
        query = """SELECT COUNT(DISTINCT t.buyer_nick) AS unly
FROM(SELECT buyer_nick
FROM customer_trade
WHERE seller_nick<>%%s
AND buyer_nick IN (%s)) t
LEFT JOIN
(SELECT buyer_nick
FROM customer_trade
WHERE seller_nick=%%s
AND buyer_nick IN (%s)) st
ON t.buyer_nick = st.buyer_nick""" % (customers, customers)
        return Model.fetch_one(query, self.nick, self.nick).unly

    def get_lost_costs(self, customers):
        query = """SELECT ROUND(SUM(cost), 2) lost_costs
FROM customer_trade
WHERE seller_nick!=%%s
AND buyer_nick IN (%s)""" % (customers)
        return Model.fetch_one(query, self.nick, ).lost_costs

    @staticmethod
    def create_not_exist(uid, nick):
        stmt = "SELECT * FROM user WHERE top_uid=%s"
        user = Model.find_by_sql(stmt, uid)
        if user:
            return False
        else:
            return User.create(uid, nick)

    @staticmethod
    def create(uid, nick):
        stmt = "INSERT IGNORE user(top_nick, top_uid) VALUES(%s, %s)"
        try:
            Model.execute(stmt, nick, uid)
            User.init_setting(nick)
            return True
        except:
            return False

    @staticmethod
    def init_setting(nick):
        query = "REPLACE INTO user_settings (nick, classify_tree, keywords) VALUES(%s, %s, '[]')"
        Model.execute(query, nick, json.dumps(_tree))

    @staticmethod
    def save_his_oauth(uid, nick, expires_in, access_token):
        stmt = "INSERT INTO his_oauth(taobao_user_id, taobao_user_nick, \
                expires_in, access_token) VALUES(%s, %s, %s, %s)"
        try:
            Model.execute(stmt, uid, nick, expires_in, access_token)
            return True
        except:
            return False

    @staticmethod
    def update_customer_stst(seller_nick):
        stmt = "REPLACE INTO ststc_shop_customer(seller_nick, buyer_nick, costs, buy_times, last_buy_time) \
                SELECT seller_nick, buyer_nick, SUM(total_fee)as costs, COUNT(buyer_nick) AS buy_times, MAX(end_time) as last_buy_time \
                FROM trade WHERE seller_nick=%s AND status='TRADE_FINISHED' \
                GROUP BY buyer_nick"
        try:
            Model.execute(stmt, seller_nick)
            return True
        except:
            return False

    @staticmethod
    def get_custumer_classify_by_nick(nick):
        return Model.fetch_one("SELECT classify_tree FROM user_settings  WHERE nick=%s", nick).classify_tree

    @staticmethod
    def get_customers_by_classfify(nick, where=None):
        if where is None:
            query = "SELECT c.nick as name, CONCAT('http://i.taobao.com/', c.uid) as link FROM ststc_shop_customer s \
                     INNER JOIN customer c ON  s.buyer_nick=c.nick \
                     WHERE s.seller_nick=%s "
        else:
            stmt = []
            for i, r in enumerate(where):
                stmt.append(User._query_stmt[i] % (r[0], r[1]))
            stmt = "AND".join(stmt)
            # logging.info(stmt)
            query = "SELECT c.nick as name, CONCAT('http://i.taobao.com/', c.uid) AS link FROM ststc_shop_customer s \
                     INNER JOIN customer c ON  s.buyer_nick=c.nick \
                     WHERE s.seller_nick=%%s AND %s" % (stmt)

        # print query
        return Model.find_by_sql(query, nick)

    @staticmethod
    def get_customers_count(nick, where=None):
        _query_stmt = ["(buy_times >%s AND buy_times <= %s)",
                   "(DATEDIFF(NOW(), last_buy_time ) >%s AND DATEDIFF(NOW(), last_buy_time ) <= %s)",
                   "(costs >%s AND costs <= %s)"
                   ]
        if where is None:
            query = "SELECT COUNT(*) AS count FROM ststc_shop_customer \
                 WHERE seller_nick=%s"
        else:
            stmt = []
            for i, r in enumerate(where):
                stmt.append(_query_stmt[i] % (r[0], r[1]))
            stmt = "AND".join(stmt)
            query = "SELECT COUNT(*) AS count FROM ststc_shop_customer \
                 WHERE seller_nick=%%s AND %s" % (stmt)
        return Model.fetch_one(query, nick).count

    @staticmethod
    def get_last_wait_trade_time(seller_nick):
        """
        @Args:
            seller_nick ->type : str , desc : 淘宝卖家昵称

        @Return:
            strat_time ->type: str eg: 2000-01-01 00:00:0
        """
        stmt = "SELECT MAX(created) AS created \
                FROM( \
                    SELECT MIN(created) AS created \
                    FROM trade \
                    WHERE seller_nick=%s\
                    AND status NOT IN ('TRADE_CLOSED', 'TRADE_CLOSED_BY_TAOBAO', 'ALL_CLOSED') \
                    UNION SELECT (NOW() - INTERVAL 14 DAY) AS created) AS trade_time"
        start_time = Model.fetch_one(stmt, seller_nick)['created']
        return start_time
