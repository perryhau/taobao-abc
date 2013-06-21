SET @saved_cs_client = @@character_set_client;
SET character_set_client = utf8;

DROP DATABASE IF EXISTS tabobao_abc;
CREATE DATABASE taobao_abc;
USE taobao_abc;

DROP TABLE IF EXISTS user;
CREATE TABLE user(
    top_nick varchar(30) DEFAULT '',
    top_uid bigint DEFAULT 0,
    create_at timestamp NOT NULL,
    UNIQUE KEY(top_uid)
)Engine=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表';


DROP TABLE IF EXISTS user_settings;
CREATE TABLE user_settings(
nick varchar(30) PRIMARY KEY,
classify_tree TEXT NOT NULL COMMENT '',
keywords TEXT,
population_tsmp timestamp DEFAULT current_timestamp,
KEY population_tsmp(population_tsmp)
)Engine=InnoDB DEFAULT CHARSET=utf8 COMMENT='商家配置表';


DROP TABLE IF EXISTS oauth_history;
CREATE TABLE oauth_history(
    taobao_user_id bigint,
    taobao_user_nick varchar(30),
    expires_in int,
    access_token varchar(64),
    create_at timestamp NOT NULL
)Engine=InnoDB DEFAULT CHARSET=utf8 COMMENT='oauth 授权记录表';

-- DROP TABLE IF EXISTS `order`;
-- CREATE TABLE `order` (
--   `tid` varchar(30) DEFAULT NULL COMMENT '交易编号 (父订单的交易编号)',
--   `title` varchar(250) DEFAULT NULL COMMENT '商品标题',
--   `pic_path` varchar(300) DEFAULT NULL COMMENT '商品图片的绝对路径',
--   `price` float DEFAULT NULL COMMENT '商品价格',
--   `num` int(11) DEFAULT NULL COMMENT '购买数量',
--   `num_iid` varchar(30) DEFAULT NULL COMMENT '商品数字ID',
--   `sku_id` varchar(20) DEFAULT NULL COMMENT '商品的最小库存单位Sku的id.可以通过taobao.item.sku.get获取详细的Sku信息',
--   `refund_status` varchar(20) DEFAULT NULL COMMENT '退款状态',
--   `status` varchar(30) DEFAULT NULL COMMENT '订单状态',
--   `oid` varchar(30) DEFAULT NULL COMMENT '子订单编号',
--   `total_fee` float DEFAULT NULL COMMENT '应付金额（商品价格 * 商品数量 + 手工调整金额 - 订单优惠金额）',
--   `payment` float DEFAULT NULL COMMENT '子订单实付金额',
--   `discount_fee` float DEFAULT NULL COMMENT '订单优惠金额',
--   `adjust_fee` float DEFAULT NULL COMMENT '手工调整金额',
--   `sku_properties_name` varchar(100) DEFAULT NULL COMMENT 'SKU的值',
--   `item_meal_name` varchar(100) DEFAULT NULL COMMENT '套餐的值',
--   `buyer_rate` tinyint(1) DEFAULT NULL COMMENT '买家是否已评价',
--   `seller_rate` tinyint(1) DEFAULT NULL COMMENT '卖家是否已评价',
--   `outer_iid` varchar(40) DEFAULT NULL COMMENT '商家外部编码(可与商家外部系统对接)',
--   `outer_sku_id` varchar(40) DEFAULT NULL COMMENT '外部网店自己定义的Sku编号',
--   `refund_id` varchar(30) DEFAULT NULL COMMENT '最近退款ID',
--   `seller_type` varchar(5) DEFAULT NULL COMMENT '卖家类型，可选值为：B（商城商家），C（普通卖家）',
--   `population_tsmp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间戳',
--   KEY `tid` (`tid`),
--   KEY `num_iid` (`num_iid`),
--   KEY `oid` (`oid`),
--   KEY `total_fee` (`total_fee`),
--   KEY `population_tsmp` (`population_tsmp`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `trade` (
  `seller_nick` varchar(30) DEFAULT NULL COMMENT '卖家昵称',
  `buyer_nick` varchar(30) DEFAULT NULL COMMENT '买家昵称',
  `title` varchar(250) DEFAULT NULL COMMENT '交易标题',
  `type` varchar(10) DEFAULT NULL COMMENT '交易类型列表',
  `created` datetime DEFAULT NULL COMMENT '交易创建时间。格式:yyyy-MM-dd HH:mm:ss',
  `tid` varchar(30) DEFAULT NULL COMMENT '交易编号 (父订单的交易编号)',
  `seller_rate` tinyint(1) DEFAULT NULL COMMENT '卖家是否已评价',
  `buyer_rate` tinyint(1) DEFAULT NULL COMMENT '买家是否已评价',
  `status` varchar(30) DEFAULT NULL COMMENT '交易状态',
  `payment` float DEFAULT NULL COMMENT '实付金额',
  `discount_fee` float DEFAULT NULL COMMENT '系统优惠金额',
  `adjust_fee` float DEFAULT NULL COMMENT '卖家手工调整金额',
  `post_fee` float DEFAULT NULL COMMENT '邮费',
  `total_fee` float DEFAULT NULL COMMENT '商品金额（商品价格乘以数量的总金额）',
  `pay_time` datetime DEFAULT NULL COMMENT '付款时间。格式:yyyy-MM-dd HH:mm:ss',
  `end_time` datetime DEFAULT NULL COMMENT '交易结束时间。交易成功时间(更新交易状态为成功的同时更新)/确认收货时间或者交易关闭时间 。格式:yyyy-MM-dd HH:mm:ss',
  `modified` datetime DEFAULT NULL COMMENT '交易修改时间(用户对订单的任何修改都会更新此字段)',
  `consign_time` datetime DEFAULT NULL COMMENT '卖家发货时间',
  `buyer_obtain_point_fee` int(11) DEFAULT NULL COMMENT '买家获得积分,返点的积分',
  `point_fee` int(11) DEFAULT NULL COMMENT '买家使用积分',
  `real_point_fee` int(11) DEFAULT NULL COMMENT '买家实际使用积分（扣除部分退款使用的积分）',
  `received_payment` float DEFAULT NULL COMMENT '卖家实际收到的支付宝打款金额',
  `commission_fee` float DEFAULT NULL COMMENT '交易佣金',
  `pic_path` varchar(100) DEFAULT NULL COMMENT '商品图片绝对途径',
  `num_iid` varchar(30) DEFAULT NULL COMMENT '商品数字编号',
  `num` int(11) DEFAULT NULL COMMENT '商品购买数量',
  `price` float DEFAULT NULL COMMENT '商品价格',
  `cod_fee` float DEFAULT NULL COMMENT '货到付款服务费',
  `cod_status` varchar(50) DEFAULT NULL COMMENT '货到付款物流状态',
  `shipping_type` varchar(50) DEFAULT NULL COMMENT '创建交易时的物流方式',
  `receiver_name` varchar(50) DEFAULT NULL COMMENT '收货人的姓名',
  `receiver_state` varchar(20) DEFAULT NULL COMMENT '收货人的所在省份',
  `receiver_city` varchar(20) DEFAULT NULL COMMENT '收货人的所在城市',
  `receiver_district` varchar(100) DEFAULT NULL COMMENT '收货人的所在地区',
  `receiver_address` varchar(300) DEFAULT NULL COMMENT '收货人的详细地址',
  `receiver_zip` varchar(10) DEFAULT NULL COMMENT '收货人的邮编',
  `receiver_mobile` varchar(15) DEFAULT NULL COMMENT '收货人的手机号码',
  `receiver_phone` varchar(15) DEFAULT NULL COMMENT '收货人的电话号码',
  `population_tsmp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `seller_nick` (`seller_nick`),
  KEY `buyer_nick` (`buyer_nick`),
  KEY `created` (`created`),
  KEY `tid` (`tid`),
  KEY `status` (`status`),
  KEY `payment` (`payment`),
  KEY `total_fee` (`total_fee`),
  KEY `num_iid` (`num_iid`),
  KEY `num` (`num`),
  KEY `price` (`price`),
  KEY `population_tsmp` (`population_tsmp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE rate_list(
    uid int,
    aucNumId varchar(32) NOT NULL DEFAULT -1,
    auctionPrice float(2) DEFAULT -1,
    link varchar(250) DEFAULT '',
    sku varchar(250) DEFAULT '',
    title varchar(250) DEFAULT '',
    content varchar(250) DEFAULT '',
    `date` datetime DEFAULT '1900-1-1 00:00:00',
    propertiesAvg int DEFAULT 0,
    rate int DEFAULT -3,
    rateId varchar(32) DEFAULT -1,
    raterType int DEFAULT 0,
    spuRatting varchar(250) DEFAULT '',
    tradeId varchar(32) DEFAULT 0,
    useful int DEFAULT -3,
    anony tinyint(1) DEFAULT 1,
    displayRatePic varchar(20) DEFAULT '',
    nick varchar(50) DEFAULT '',
    rank int DEFAULT 0,
    userId int DEFAULT 0,
    vip varchar(15) DEFAULT '',
    vipLevel int DEFAULT -1,
    population_tsmp timestamp DEFAULT current_timestamp,
    PRIMARY KEY(tradeId, rateId),
    KEY `date`(`date`),
    KEY nick(nick(10)),
    KEY population_tsmp(population_tsmp)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='半年内评价';

DROP TABLE IF EXISTS rate_list_past;
CREATE TABLE rate_list_past(
    id int AUTO_INCREMENT PRIMARY KEY,
    uid int,
    rate varchar(10) DEFAULT '',
    content varchar(250) DEFAULT '',
    `date` datetime DEFAULT '1900-1-1 00:00:00',
    user_id int DEFAULT -1,
    rank varchar(10) DEFAULT '',
    nick varchar(50) DEFAULT '',
    title varchar(250) DEFAULT '',
    link varchar(32) DEFAULT -1,
    trade_id varchar(32) DEFAULT '',
    item_id varchar(32) DEFAULT '',
    anchor_id varchar(15) DEFAULT '',
    price float(2) DEFAULT -1,
    population_tsmp timestamp DEFAULT current_timestamp,
    KEY uid(uid),
    KEY link(link),
    KEY `date`(`date`),
    KEY nick(nick)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='半年前评价';


DROP TABLE IF EXISTS item;
CREATE TABLE item(
    detail_url VARCHAR(255) UNIQUE NOT NULL COMMENT "商品url", 
    num_id  INT(11) UNSIGNED COMMENT "商品数字id",
    title VARCHAR(60) COMMENT "商品标题,不能超过60字节",
    nick VARCHAR(50) COMMENT "卖家昵称",
    type VARCHAR(10) COMMENT "商品类型(fixed:一口价;auction:拍卖)注：取消团购",
    cat varchar(30) NOT NULL DEFAULT '' COMMENT "类目",
    brand varchar(30) NOT NULL DEFAULT '' COMMENT "品牌"
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='商品';

DROP TABLE IF EXISTS ststc_shop_customer;
CREATE TABLE ststc_shop_customer(
seller_nick varchar(30) NOT NULL COMMENT '卖家',
buyer_nick varchar(30) NOT NULL COMMENT '买家',
buy_times int NOT NULL DEFAULT 0 COMMENT '购买次数',
last_buy_time datetime NOT NULL DEFAULT '1900-1-1 00:00:00' COMMENT '最近一次购买时间',
costs decimal(20, 2) NOT NULL DEFAULT 0 COMMENT '消费金额',
population_tsmp timestamp DEFAULT current_timestamp COMMENT '更新时间戳',
PRIMARY KEY(seller_nick, buyer_nick),
KEY population_tsmp(population_tsmp)
)Engine=InnoDB DEFAULT CHARSET=utf8 COMMENT='店铺-顾客统计表';

DROP TABLE IF EXISTS ststc_customer_shop;
CREATE TABLE ststc_customer_shop(
buyer_nick varchar(30) NOT NULL COMMENT '买家',
seller_nick varchar(30) NOT NULL COMMENT '卖家',
buy_times int NOT NULL DEFAULT 0 COMMENT '购买次数',
last_buy_time datetime NOT NULL DEFAULT '1900-1-1 00:00:00' COMMENT '最近一次购买时间',
costs decimal(20, 2) NOT NULL DEFAULT 0 COMMENT '消费金额',
population_tsmp timestamp DEFAULT current_timestamp COMMENT '更新时间戳',
PRIMARY KEY(buyer_nick, seller_nick),
KEY population_tsmp(population_tsmp)
)Engine=InnoDB DEFAULT CHARSET=utf8 COMMENT='顾客-店铺消费统计';

DROP TABLE IF EXISTS shop;
CREATE TABLE shop(
    user_id bigint PRIMARY KEY,
    nick varchar(100) DEFAULT '' COMMENT '卖家昵称',
    sid bigint DEFAULT 0 COMMENT '店铺编号。shop+sid.taobao.com即店铺地址',
    cid int DEFAULT 0 COMMENT '店铺所属的类目编号',
    title varchar(200) DEFAULT '' COMMENT '店铺标题',
    population_tsmp timestamp DEFAULT current_timestamp
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='基本店铺信息';

DROP TABLE IF EXISTS customer;
CREATE TABLE customer(
    nick VARCHAR(30) NOT NULL, 
    uid BIGINT NOT NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS item;
CREATE TABLE item(
    item_id bigint PRIMARY KEY,
    cid int NOT NULL DEFAULT 0,
    cat varchar(30) NOT NULL DEFAULT '',
    img varchar(250),
    location varchar(30) NOT NULL DEFAULT '',
    nick varchar(50) NOT NULL DEFAULT '',
    price float(2),
    title varchar(250),
    brand varchar(30) NOT NULL DEFAULT '',
    scid int DEFAULT 0,
    sid int DEFAULT 0,
    volume int DEFAULT 0,
    population_tsmp timestamp DEFAULT current_timestamp,
    KEY cid(cid),
    KEY cat(cat),
    KEY nick(nick),
    KEY brand(brand)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='';

DROP TABLE IF EXISTS rate_list;
CREATE TABLE rate_list(
    uid int,
    aucNumId varchar(32) NOT NULL DEFAULT -1,
    auctionPrice float(2) DEFAULT -1,
    link varchar(250) DEFAULT '',
    sku varchar(250) DEFAULT '',
    title varchar(250) DEFAULT '',
    content varchar(250) DEFAULT '',
    `date` datetime DEFAULT '1900-1-1 00:00:00',
    propertiesAvg int DEFAULT 0,
    rate int DEFAULT -3,
    rateId varchar(32) DEFAULT -1,
    raterType int DEFAULT 0,
    spuRatting varchar(250) DEFAULT '',
    tradeId varchar(32) DEFAULT 0,
    useful int DEFAULT -3,
    anony tinyint(1) DEFAULT 1,
    displayRatePic varchar(20) DEFAULT '',
    nick varchar(50) DEFAULT '',
    rank int DEFAULT 0,
    userId int DEFAULT 0,
    vip varchar(15) DEFAULT '',
    vipLevel int DEFAULT -1,
    population_tsmp timestamp DEFAULT current_timestamp,
    PRIMARY KEY(tradeId, rateId),
    KEY `date`(`date`),
    KEY nick(nick(10)),
    KEY population_tsmp(population_tsmp)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='';

DROP TABLE IF EXISTS rate_list_past;
CREATE TABLE rate_list_past(
    id int AUTO_INCREMENT PRIMARY KEY,
    uid int,
    rate varchar(10) DEFAULT '',
    content varchar(250) DEFAULT '',
    `date` datetime DEFAULT '1900-1-1 00:00:00',
    user_id int DEFAULT -1,
    rank varchar(10) DEFAULT '',
    nick varchar(50) DEFAULT '',
    title varchar(250) DEFAULT '',
    link varchar(32) DEFAULT -1,
    trade_id varchar(32) DEFAULT '',
    item_id varchar(32) DEFAULT '',
    anchor_id varchar(15) DEFAULT '',
    price float(2) DEFAULT -1,
    population_tsmp timestamp DEFAULT current_timestamp,
    KEY uid(uid),
    KEY link(link),
    KEY `date`(`date`),
    KEY nick(nick)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='';


DROP VIEW  IF EXISTS customer_trade;
CREATE VIEW customer_trade AS
    (SELECT 
        r.aucNumid AS item_id,
        r.title,
        r.nick AS seller_nick, 
        c.nick AS buyer_nick, 
        r.auctionPrice AS cost,
        `date` 
    FROM rate_list AS r LEFT JOIN customer AS c ON r.uid = c.uid)
UNION 
    (SELECT  
        r.item_id,
        r.title,
        r.nick AS seller_nick, 
        c.nick AS buyer_nick, 
        r.price AS cost,
        `date`
    FROM rate_list_past AS r LEFT JOIN customer AS c ON r.uid = c.uid);

SET @saved_cs_client = @@character_set_client;
SET character_set_client = utf8;



