#!/usr/bin/python2.7
# -*- coding: utf-8 -*-


from taobao import TopRequest, TopClient


def get_top_sold_trades(session):
    """order:
        orders.tid,orders.title,orders.pic_path,orders.price,\
                     orders.num,orders.sku_id,orders.refund_status,orders.status,orders.oid,\
                     orders.total_fee,orders.payment,orders.discount_fee,orders.adjust_fee,\
                     orders.sku_properties_name,orders.item_meal_name,orders.buyer_rate,\
                     orders.seller_rate,orders.outer_iid,orders.outer_sku_id,\
                     orders.refund_id,orders.seller_type'
    """
    req = TopRequest("taobao.trades.sold.get")
    req['fields'] = 'seller_nick,buyer_nick,title,type,created,tid,seller_rate,buyer_rate,\
                     status,payment,adjust_fee,post_fee,total_fee,pay_time,end_time,\
                     modified,consign_time,buyer_obtain_point_fee,real_point_fee,\
                     received_payment,pic_path,num_iid,num,price,cod_fee,consign_time,\
                     cod_status,shipping_type,receiver_name,receiver_state,receiver_city,\
                     receiver_district,receiver_address,receiver_zip,receiver_mobile,\
                     receiver_phone'
    req['status'] = 'TRADE_FINISHED'
    client = TopClient()
    response = client.execute(req, session)
    return response.json()


def get_update_sold_trades(session, start_time):
    req = TopRequest("taobao.trades.sold.get")
    req['fields'] = 'seller_nick,buyer_nick,title,type,created,tid,seller_rate,buyer_rate,\
                     status,payment,adjust_fee,post_fee,total_fee,pay_time,end_time,\
                     modified,consign_time,buyer_obtain_point_fee,real_point_fee,\
                     received_payment,pic_path,num_iid,num,price,cod_fee,consign_time,\
                     cod_status,shipping_type,receiver_name,receiver_state,receiver_city,\
                     receiver_district,receiver_address,receiver_zip,receiver_mobile,\
                     receiver_phone'
    req['start_time'] = start_time
    client = TopClient()
    response = client.execute(req, session)
    return response.json()

def get_taobao_shop(seller_nick):
    """
    @param nick
    @return {
        bulletin: ,
        cid: 1048,
        created: 2007-08-25 15:24:54,
        desc: <p>专业数码周边供应商</p>,
        modified: 2013-04-24 12: 07: 22,
        nick: udddf999,
        pic_path: /85/b4/T1nxnPXjxdXXartXjX,
        sid: 34782328,
        title: 三门数码 专业数码周边供应商
    }
    """
    req = TopRequest("taobao.shop.get")
    req['fields'] = 'sid,cid,title,nick'
    req['nick'] = seller_nick
    client = TopClient()
    response = client.execute(req)
    return response.json()['shop_get_response']['shop']

def get_taobao_item(num_iid):
    """
    @see http://api.taobao.com/apitools/apiTools.htm?catId=4&apiName=taobao.item.get

    @param num_iid
    """
#     params = {
#         'method': 'taobao.item.get',
#         'fields': 'detail_url,num_iid,title,nick,type,cid,seller_cids,props,input_pids,input_str,pic_url,num,valid_thru,list_time,delist_time,stuff_status,location,price,post_fee,express_fee,ems_fee,has_discount,freight_payer,has_invoice,has_warranty,has_showcase,modified,increment,approve_status,postage_id,product_id,auction_point,property_alias,item_img,prop_img,sku,video,outer_id,is_virtual'
#     }
    req = TopRequest("taobao.item.get")
    req['fields'] = 'detail_url,num_iid,title,nick,type,cid,seller_cids,props,input_pids,input_str,pic_url,num,valid_thru,list_time,delist_time,stuff_status,location,price,post_fee,express_fee,ems_fee,has_discount,freight_payer,has_invoice,has_warranty,has_showcase,modified,increment,approve_status,postage_id,product_id,auction_point,property_alias,item_img,prop_img,sku,video,outer_id,is_virtual'
    req['num_iid'] = num_iid
    client = TopClient()
    response = client.execute(req)
    return response.json().get('item_get_response')['item']




