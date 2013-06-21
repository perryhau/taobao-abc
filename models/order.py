#!/usr/bin/python2.7
# -*- coding: utf-8 -*-

from model import Model

class Order(Model):

    """
    cols:['tid', 'title', 'pic_path', 'price', 'num',
        'sku_id', 'refund_status', 'status', 'oid',
        'total_fee', 'payment', 'adjust_fee', 'sku_properties_name',
        'item_meal_name', 'buyer_rate','seller_rate', 'outer_iid',
        'outer_sku_id','refund_id', 'seller_type'
    ]
    """
    __tablename__ = "order"

    def __init__(self):
        Model.__init__(self)

    @classmethod
    def save_many(cls, cols, valuelist):
        Model.save_many(Order.__tablename__, cols, valuelist)

    @classmethod
    def replace_many(cls, cols, valuelist):
        Model.replace_many(Order.__tablename__, cols, valuelist)
