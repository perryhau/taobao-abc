#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

import threading
import time
from .top import get_top_sold_trades, get_update_sold_trades, get_taobao_shop
from models.order import Order
from models.trade import Trade
from models.top_user import User
from models.shop import Shop
from models.buyer import Buyer


try:
    import cPickle as pickle
except:
    import pickle


class _Item:

    def __init__(self, data):
        self.data = data

    def __getattr__(self, name):
        try:
            return self.data[name]
        except:
            return None


class Task:

    def __init__(self, name="Base Task"):
        self.name = name

    def do_task(self):
        raise NotImplementedError("Not implemention")

    # def run(self):
    #     raise NotImplementedError("Not implemention")


class UserTradeTaskMinix:

    trade_cols = ['adjust_fee', 'buyer_nick', 'buyer_obtain_point_fee', 'buyer_rate', 'cod_fee', 'cod_status',
                  'consign_time', 'created', 'end_time', 'modified', 'num', 'num_iid', 'pay_time', 'payment',
                  'pic_path', 'post_fee', 'price', 'real_point_fee', 'received_payment', 'receiver_address',
                  'receiver_city', 'receiver_district', 'receiver_mobile', 'receiver_name', 'receiver_phone',
                  'receiver_state', 'receiver_zip', 'seller_nick', 'seller_rate', 'shipping_type', 'status',
                  'tid', 'title', 'total_fee', 'type'
                  ]
    order_cols = ['adjust_fee', 'buyer_rate', 'discount_fee', 'item_meal_name', 'num', 'oid', 'outer_iid',
                  'outer_sku_id', 'payment', 'pic_path', 'price', 'refund_id', 'refund_status',
                  'seller_rate', 'seller_type', 'sku_id', 'sku_properties_name', 'status', 'tid',
                  'title', 'total_fee'
                  ]

    def update_customer_stst(self, seller_nick):
        User.update_customer_stst(seller_nick)

    def save_orders(self, orders):
        if len(orders):
            Order.save_many(UserTradeTaskMinix.order_cols, orders)

    def save_trades(self, trades):
        if len(trades):
            Trade.save_many(UserTradeTaskMinix.trade_cols, trades)

    def replace_orders(self, orders):
        if len(orders):
            Order.replace_many(UserTradeTaskMinix.order_cols, orders)

    def replace_trades(self, trades):
        if len(trades):
            Trade.replace_many(UserTradeTaskMinix.trade_cols, trades)

    def have_trades(self, response):
        if "trades_sold_get_response" in response and response['trades_sold_get_response']['total_results'] > 0:
            return True
        return False

    def _trade_tuple(self, trade):
        i = _Item(trade)
        return (i.adjust_fee,
                i.buyer_nick,
                i.buyer_obtain_point_fee,
                i.buyer_rate,
                i.cod_fee,
                i.cod_status,
                i.consign_time,
                i.created,
                i.end_time,
                i.modified,
                i.num,
                i.num_iid,
                i.pay_time,
                i.payment,
                i.pic_path,
                i.post_fee,
                i.price,
                i.real_point_fee,
                i.received_payment,
                i.receiver_address,
                i.receiver_city,
                i.receiver_district,
                i.receiver_mobile,
                i.receiver_name,
                i.receiver_phone,
                i.receiver_state,
                i.receiver_zip,
                i.seller_nick,
                i.seller_rate,
                i.shipping_type,
                i.status,
                i.tid,
                i.title,
                i.total_fee,
                i.type
                )

    def _order_tuple(self, order):
        i = _Item(order)
        return (i.adjust_fee,
                i.buyer_rate,
                i.discount_fee,
                i.item_meal_name,
                i.num,
                i.oid,
                i.outer_iid,
                i.outer_sku_id,
                i.payment,
                i.pic_path,
                i.price,
                i.refund,
                i.refund_status,
                i.seller_rate,
                i.seller_type,
                i.sku_id,
                i.sku_properties_name,
                i.status,
                i.tid,
                i.title,
                i.total_fee
                )


class UserTradeInitTask(Task, UserTradeTaskMinix):

    def __init__(self, user, queue, name="User Trade Init Task"):
        Task.__init__(self, name)
        self.session = user['access_token']
        self.user = user
        self.queue = queue

    def init_shop(self):
        shop = get_taobao_shop(self.user['nick'])

        shop['user_id'] = self.user['uid']
        Shop.create(shop)

    def do_task(self):
        self.init_shop()
        response = get_top_sold_trades(self.session)
        # pprint.pprint(response)
        trades = []
        # orders = []
        if self.have_trades(response):
            d_trades = response['trades_sold_get_response']['trades']['trade']
            for d_trade in d_trades:
                self.queue.enqueue("customer",
                                   pickle.dumps(CustomerUpdateTask(d_trade['buyer_nick'])))
                trades.append(self._trade_tuple(d_trade))
            self.save_trades(trades)
            self.update_customer_stst(self.user['nick'])

#“订单处理”
#                 for order in d_trades['orders']['order']:
#                     print "Order :" , order
#                     orders.append(self._order_tuple(order))
#            self.save_orders(orders)

    def __call__(self):
        worker = threading.Thread(target=self.do_task)
        worker.start()


class UserTradeUpdateTask(Task, UserTradeTaskMinix):

    def __init__(self, user, queue, name="User Trade Init Task"):
        Task.__init__(self, name)
        self.session = user['access_token']
        self.user = user
        self.queue = queue

    def do_task(self):
        start_time = User.get_last_wait_trade_time(self.user['nick'])
        print start_time
        response = get_update_sold_trades(self.session, start_time)
        # pprint.pprint(response)
        trades = []

        if self.have_trades(response):
            d_trades = response['trades_sold_get_response']['trades']['trade']
            for d_trade in d_trades:
                # pprint.pprint(d_trade)
                self.queue.enqueue("customer", pickle.dumps(CustomerUpdateTask(d_trade['buyer_nick'])))
                trades.append(self._trade_tuple(d_trade))
            self.replace_trades(trades)
            self.update_customer_stst(self.user['nick'])

    def __call__(self):
        worker = threading.Thread(target=self.do_task)
        worker.start()


class CustomerUpdateTask(Task):

    def __init__(self, nick, name="Customer Update Task"):
        """"""
        Task.__init__(self, name)
        self.nick = nick

    def do_task(self):
        #update_user_full(self.nick)
        # buyer = Buyer(self.nick)
        # buyer.update_ststc_customer_shop()
        pass

    def __call__(self):
        self.do_task()


class TestTask(Task):

    def __init__(self, name="Test task"):
        Task.__init__(self, name)

    def do_task(self):
        print "I am alive (%s)" % (self.name)

    def __call__(self):
        self.do_task()



