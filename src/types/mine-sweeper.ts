export enum MineSweeperStatus {
  init,
  doing,
  success,
  fail,
}

export enum MineItemStatus {
  // 遮蔽
  close,
  // 打开
  open,
  // 插旗子
  flag,
  // 问号
}
export interface MineItem {
  // 雷的编号，初始位置
  id: number;
  // 开局后的位置
  index: number;

  // 此处是否是雷
  is_mine: 0 | 1;
  // 引爆点
  isTippingPoint?: boolean;
  // 当前状态
  status: MineItemStatus;
  // 周围雷的数量
  around_mine_count: number;
  // 周围位置总数
  around_count: number;

  // 处理完成，周围非雷位置均打开
  resolved?: boolean;

  // 二选一
  group_2_1: number[];
}
