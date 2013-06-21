#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

from model import Model
import logging


class Buyer(Model):

    def __init__(self, nick):
        Model.__init__(self)
        self.nick = nick

    def loalty(self):
        pass

    def get_uid(self):
        query = "SELECT uid FROM customer WHERE nick=%s"
        row = Model.fetch_one(query, self.nick)
        return row.uid

    def get_fav_page(self):
        query = """SELECT COUNT(i.cat) AS total
FROM customer_trade ct LEFT JOIN item i ON (ct.item_id=i.item_id)
WHERE i.cat IS NOT NULL AND ct.buyer_nick=%s
"""
        total = Model.fetch_one(query, self.nick)['total']
        return (total / 50) + 1

    def get_fav(self, page=1):
        query = """SELECT i.cat, i.brand, COUNT(ct.item_id) AS count,
        GROUP_CONCAT(i.item_id ORDER BY i.item_id) AS iids,
        GROUP_CONCAT(SUBSTRING(i.title, 1, 40) ORDER BY i.item_id) AS titles,
        GROUP_CONCAT(i.sid ORDER BY i.item_id) AS sids,
        GROUP_CONCAT(i.nick ORDER By i.item_id) AS nicks,
        GROUP_CONCAT(i.price ORDER BY i.price) AS prices
FROM customer_trade ct LEFT JOIN item i ON (ct.item_id=i.item_id)
WHERE i.cat IS NOT NULL AND ct.buyer_nick=%s
GROUP BY i.cat, i.brand
ORDER BY COUNT(ct.item_id) DESC
LIMIT %s, 50"""
        offset = (page - 1) * 50

        rows = Model.find_by_sql(query, self.nick, offset)
        return rows

    def get_rate_total(self):
        query = """
SELECT CAST(SUM(total) AS SIGNED) total
FROM
(SELECT COUNT(*)  total
FROM rate_list T1
WHERE uid='{0}'
UNION
SELECT
    COUNT(*) total
FROM rate_list_past T1
WHERE uid='{0}') r""".format(self.get_uid())
        total = Model.fetch_one(query).total
        return total

    def rate_list(self, page=1, count=50):
        query = """SELECT
    DATE_FORMAT(`date`, '%%Y-%%m-%%d %%H:%%i:%%S') AS buy_time,
    nick AS seller,
    content as rate_content,
    title, rate AS rate_level
FROM rate_list T1
WHERE uid='{0}'
UNION
SELECT
    DATE_FORMAT(`date`, '%%Y-%%m-%%d %%H:%%i:%%S') As buy_time,
    nick AS seller,
    content AS rate_content,
    title,
    rate As rate_level
FROM rate_list_past T1
WHERE uid='{0}'
LIMIT %s, %s""".format(self.get_uid())
        offset = (page - 1) * count
        rows = Model.find_by_sql(query, offset, count)
        return rows

    def update_ststc_customer_shop(self):
        query = """REPLACE INTO ststc_customer_shop(seller_nick, buyer_nick, costs, buy_times, last_buy_time)
SELECT  seller_nick,
        buyer_nick,
        SUM(costs) AS costs,
        SUM(buy_times) AS buy_times,
        MAX(last_buy_time) AS last_buy_time
FROM
    ((SELECT
        r.nick AS seller_nick,
        c.nick AS buyer_nick,
        SUM(r.auctionPrice) AS costs,
        COUNT(r.uid) AS buy_times,
        MAX(`date`) AS last_buy_time
    FROM rate_list AS r LEFT JOIN customer AS c ON r.uid = c.uid
    WHERE c.nick=%s)
    UNION
    (SELECT
        r.nick AS seller_nick,
        c.nick AS buyer_nick,
        SUM(r.price) AS costs,
        COUNT(r.uid) AS buy_times,
        MAX(`date`) AS last_buy_time
    FROM rate_list_past AS r LEFT JOIN customer AS c ON r.uid = c.uid
    WHERE c.nick=%s)) AS r"""
        Model.execute_db(query, self.nick, self.nick)


