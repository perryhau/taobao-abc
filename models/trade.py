from model import Model



class Trade(Model):

    """
    cols:['seller_nick', 'buyer_nick', 'title', 'type',
        'created', 'tid', 'seller_rate', 'buyer_rate',
        'status', 'payment', 'adjust_fee', 'post_fee',
        'total_fee', 'pay_time', 'end_time', 'modified',
        'consign_time', 'buyer_obtain_point_fee',
        'real_point_fee', 'received_payment', 'commission_fee',
        'pic_path', 'num_iid', 'num', 'price', 'cod_fee',
        'cod_status', 'shipping_type', 'receiver_name',
        'receiver_state', 'receiver_city', 'receiver_district',
        'receiver_address', 'receiver_zip', 'receiver_mobile',
        'receiver_phone'
    ]
    """

    __tablename__ = "trade"

    def __init__(self):
        Model.__init__(self)

    @classmethod
    def save_many(cls, cols, valuelist):
        Model.save_many(Trade.__tablename__, cols, valuelist)

    @classmethod
    def replace_many(cls, cols, valuelist):
        Model.replace_many(Trade.__tablename__, cols, valuelist)
