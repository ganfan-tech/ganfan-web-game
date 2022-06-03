import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GenericErrors } from '../../types/error';
import { MineItem, MineSweeperStatus, MineItemStatus } from '../../types/mine-sweeper';
import { chunk, shuffle } from 'lodash';
import { store } from '../../state/store';

export interface MineSweeperGameState {
  gameStatus: MineSweeperStatus;
  mines_initial: MineItem[];
  mines_actual: MineItem[];
  mines: MineItem[][];
  start_time: Date | null;
}

const createInitialState: () => MineSweeperGameState = () => {
  let id = 0;
  const mines_initial: MineItem[] = [];
  for (let i = 0; i < 480; i++) {
    mines_initial[i] = {
      is_mine: id < 99 ? 1 : 0,
      index: id,
      id: id++,
      status: MineItemStatus.close,
      count: 0,
      around_count: 8,
    };
  }
  const mines_actual: MineItem[] = [...mines_initial];
  const mines_matrix: MineItem[][] = chunk(mines_actual, 30);

  return {
    gameStatus: MineSweeperStatus.init,
    mines_initial,
    mines_actual,
    mines: mines_matrix,
    start_time: null,
  };
};

const getItemOrNull = (mines: MineItem[][], x: number, y: number) => {};

interface AroundItem {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
  item: MineItem;
}

const getAroundItemsFromMatrix = (
  mines: MineItem[][],
  x: number,
  y: number,
  withSelf: boolean = false
): AroundItem[] => {
  /**
   * 知道索引，然后就知道在第几行，第几列
   * x = Math.floor(i /30)
   * y = i % 30
   * 周围的8个位置分别是：
   * (x - 1, y - 1)
   * (x - 1, y)
   * (x - 1, y + 1)
   * (x, y - 1)
   * (x, y + 1)
   * (x + 1, y - 1)
   * (x + 1, y)
   * (x + 1, y + 1)
   *
   * 四个角的只有3个位置，
   * 其他边上的非角位置有5个位置
   */
  let results: AroundItem[] = [];
  if ((x === 0 && y === 0) || (x === 0 && y === 29) || (x === 15 && y === 0) || (x === 15 && y === 29)) {
    if (x === 0 && y === 0) {
      results = [
        { x: 0, y: 1, item: mines[x][y + 1] },
        { x: 1, y: 0, item: mines[x + 1][y] },
        { x: 1, y: 1, item: mines[x + 1][y + 1] },
      ];
    } else if (x === 0 && y === 29) {
      results = [
        { x: 0, y: -1, item: mines[x][y - 1] },
        { x: 1, y: -1, item: mines[x + 1][y - 1] },
        { x: 1, y: 0, item: mines[x + 1][y] },
      ];
    } else if (x === 15 && y === 0) {
      results = [
        { x: -1, y: 0, item: mines[x - 1][y] },
        { x: -1, y: 1, item: mines[x - 1][y + 1] },
        { x: 0, y: 1, item: mines[x][y + 1] },
      ];
    } else {
      results = [
        { x: -1, y: -1, item: mines[x - 1][y - 1] },
        { x: -1, y: 0, item: mines[x - 1][y] },
        { x: 0, y: -1, item: mines[x][y - 1] },
      ];
    }
  } else if (x === 0 || x === 15 || y === 0 || y === 29) {
    if (x === 0) {
      results = [
        { x: 0, y: -1, item: mines[x][y - 1] },
        { x: 0, y: 1, item: mines[x][y + 1] },
        { x: 1, y: -1, item: mines[x + 1][y - 1] },
        { x: 1, y: 0, item: mines[x + 1][y] },
        { x: 1, y: 1, item: mines[x + 1][y + 1] },
      ];
    } else if (x === 15) {
      results = [
        { x: -1, y: -1, item: mines[x - 1][y - 1] },
        { x: -1, y: 0, item: mines[x - 1][y] },
        { x: -1, y: 1, item: mines[x - 1][y + 1] },
        { x: 0, y: -1, item: mines[x][y - 1] },
        { x: 0, y: 1, item: mines[x][y + 1] },
      ];
    } else if (y === 0) {
      results = [
        { x: -1, y: 0, item: mines[x - 1][y] },
        { x: -1, y: 1, item: mines[x - 1][y + 1] },
        { x: 0, y: 1, item: mines[x][y + 1] },
        { x: 1, y: 0, item: mines[x + 1][y] },
        { x: 1, y: 1, item: mines[x + 1][y + 1] },
      ];
    } else {
      results = [
        { x: -1, y: -1, item: mines[x - 1][y - 1] },
        { x: -1, y: 0, item: mines[x - 1][y] },
        { x: 0, y: -1, item: mines[x][y - 1] },
        { x: 1, y: -1, item: mines[x + 1][y - 1] },
        { x: 1, y: 0, item: mines[x + 1][y] },
      ];
    }
  } else {
    // 遍历周围8个位置
    results = [
      { x: -1, y: -1, item: mines[x - 1][y - 1] },
      { x: -1, y: 0, item: mines[x - 1][y] },
      { x: -1, y: 1, item: mines[x - 1][y + 1] },
      { x: 0, y: -1, item: mines[x][y - 1] },
      { x: 0, y: 1, item: mines[x][y + 1] },
      { x: 1, y: -1, item: mines[x + 1][y - 1] },
      { x: 1, y: 0, item: mines[x + 1][y] },
      { x: 1, y: 1, item: mines[x + 1][y + 1] },
    ];
  }

  if (withSelf) {
    results.push({ x: 0, y: 0, item: mines[x][y] });
  }

  return results;
};

const getAroundItemsFromArray = (
  mineArr: MineItem[],
  index: number,
  withSelf: boolean = false
): Array<AroundItem & { index: number }> => {
  const mines = chunk(mineArr, 30);
  let x = Math.floor(index / 30);
  let y = index % 30;
  const result = getAroundItemsFromMatrix(mines, x, y, withSelf);
  return result.map((item) => {
    return {
      ...item,
      index: (x + item.x) * 30 + (y + item.y),
    };
  });
};
// 判断是否在一个位置的周围
const judgeIsAround = (currentIndex: number, anotherIndex: number): boolean => {
  let x1 = Math.floor(currentIndex / 30);
  let y1 = currentIndex % 30;
  let x2 = Math.floor(anotherIndex / 30);
  let y2 = anotherIndex % 30;
  if (Math.abs(x1 - x2) > 1) return false;
  if (Math.abs(y1 - y2) > 1) return false;

  return true;
};

// 打开周围区域
const openAroundItems = (mineArr: MineItem[], index: number) => {
  if (mineArr[index].count === 0) {
    const aroundItems = getAroundItemsFromArray(mineArr, index);
    aroundItems.forEach((item) => {
      if (item.item.status === MineItemStatus.close && item.item.is_mine === 0) {
        item.item.status = MineItemStatus.open;
        let x = Math.floor(index / 30);
        let y = index % 30;
        const itemIndex = (x + item.x) * 30 + (y + item.y);
        openAroundItems(mineArr, itemIndex);
      }
    });
  }

  // const currentItem = mineArr[index];
  // const currentIs0 = currentItem.count === 0;
  // const aroundItems = getAroundItemsFromArray(mineArr, index);
  // aroundItems.forEach((item) => {
  //   // if (currentIs0 || item.item.count ===0) {}
  //   if ((currentIs0 || item.item.count === 0) && item.item.status === MineItemStatus.close && item.item.is_mine === 0) {
  //     item.item.status = MineItemStatus.open;
  //     let x = Math.floor(index / 30);
  //     let y = index % 30;
  //     const itemIndex = (x + item.x) * 30 + (y + item.y);
  //     openAroundItems(mineArr, itemIndex);
  //   }
  // });
};

const slice = createSlice({
  name: 'mineSweeper',
  initialState: createInitialState(),
  reducers: {
    initGame: () => createInitialState(),
    gameSuccess: (state: MineSweeperGameState) => {
      // 成功了！
      console.log('你赢了');
      state.gameStatus = MineSweeperStatus.success;
    },
    gameFail: (state: MineSweeperGameState, action: PayloadAction<{ clickIndex: number }>) => {
      console.log('你输了');
      state.gameStatus = MineSweeperStatus.fail;
    },
    startGame: (state: MineSweeperGameState, action: PayloadAction<{ clickIndex: number }>) => {
      const clickIndex = action.payload.clickIndex;
      console.log('点击位置', clickIndex);
      // 打乱顺序
      const len = state.mines_actual.length;
      state.mines_actual = shuffle(state.mines_actual);

      // 如果点击处是雷，需要更换一下位置，
      // 为了优化用户体验，点击处及周围都不能为雷

      const aroundItemsWithSelf = getAroundItemsFromArray(state.mines_actual, clickIndex, true);

      const aroundItemsIsMine = aroundItemsWithSelf.filter((item) => item.item.is_mine);

      let switchIndex = Math.floor(len / 3);
      console.log('周围有雷的：');
      aroundItemsIsMine.forEach((item) => {
        console.log(item);
      });
      console.log('----------');
      aroundItemsIsMine.forEach((item) => {
        console.log(item);

        for (; switchIndex < len; switchIndex += 3) {
          console.log(
            switchIndex,
            Math.floor(switchIndex / 30),
            switchIndex % 30,
            state.mines_actual[switchIndex].is_mine,
            judgeIsAround(clickIndex, switchIndex)
          );
          if (state.mines_actual[switchIndex].is_mine === 0 && !judgeIsAround(clickIndex, switchIndex)) {
            // 找到第一个不是雷的位置，交换
            console.log('交换位置', item.index, switchIndex);
            [state.mines_actual[switchIndex], state.mines_actual[item.index]] = [
              state.mines_actual[item.index],
              state.mines_actual[switchIndex],
            ];
            break;
          }
        }
      });

      // 排矩阵
      state.mines = chunk(state.mines_actual, 30);

      // 遍历所有区域
      for (let i = 0; i < len; i++) {
        // 确定索引
        const item = state.mines_actual[i];
        item.index = i;

        // 计算每一个区域周围雷的数量
        let x = Math.floor(i / 30);
        let y = i % 30;

        const aroundItems = getAroundItemsFromMatrix(state.mines, x, y);
        item.around_count = aroundItems.length;
        item.count = aroundItems.filter((item) => item.item.is_mine).length;
      }
      state.gameStatus = MineSweeperStatus.doing;
      state.start_time = new Date();

      slice.caseReducers.clickLeft(state, action);
    },
    clickLeft: (state: MineSweeperGameState, action: PayloadAction<{ clickIndex: number }>) => {
      const clickIndex = action.payload.clickIndex;
      const clickItem = state.mines_actual[clickIndex];
      if (clickItem.status !== MineItemStatus.close) {
        // 如果当前状态为打开或者插旗子都返回
        return;
      }
      if (clickItem.is_mine === 1) {
        clickItem.isTippingPoint = true;
        slice.caseReducers.gameFail(state, action);
      }
      // 左击
      clickItem.status = MineItemStatus.open;
      openAroundItems(state.mines_actual, clickIndex);

      state.mines_actual = [...state.mines_actual];
      state.mines = chunk(state.mines_actual, 30);

      // 深度遍历
      // 如果当前位置为空，要把周围的都打开
      // if (state.mines_actual[clickIndex].count === 0) {
      //   const aroundItems = getAroundItemsFromArray(state.mines_actual, clickIndex);
      //   aroundItems.forEach((item) => {
      //     if (item.item.status === MineItemStatus.close && item.item.is_mine === 0) {
      //       item.item.status = MineItemStatus.open;
      //       // 再遍历它周围的位置
      //       if (item.item.count === 0) {
      //         // 位置 item.位置
      //         const aroundItems = getAroundItemsFromArray(state.mines_actual, clickIndex);
      //       }
      //     }
      //   });
      // }

      // 每次点击都要遍历， 如果所有不是雷的区域都是open了，说明就赢了
      const allOpen = state.mines_actual.every((item) => {
        if (item.is_mine === 0 && item.status === MineItemStatus.open) return true;
        if (item.is_mine === 1 && item.status !== MineItemStatus.open) return true;
      });
      if (allOpen) {
        slice.caseReducers.gameSuccess(state);
      }
    },
    clickRight: (state: MineSweeperGameState, action: PayloadAction<{ clickIndex: number }>) => {
      // 插旗子或取消插旗子
      console.log(action);
      const clickIndex = action.payload.clickIndex;
      const clickItem = state.mines_actual[clickIndex];

      if (clickItem.status === MineItemStatus.close) {
        clickItem.status = MineItemStatus.flag;
      } else if (clickItem.status === MineItemStatus.flag) {
        clickItem.status = MineItemStatus.close;
      } else if (clickItem.status === MineItemStatus.open) {
        // 打开的状态下，右击相当于触发中键点击
        slice.caseReducers.clickMiddle(state, action);
      }

      state.mines_actual = [...state.mines_actual];
      state.mines = chunk(state.mines_actual, 30);
    },
    clickMiddle: (state: MineSweeperGameState, action: PayloadAction<{ clickIndex: number }>) => {
      // 判断数字跟周围的旗子数是否匹配
      // 如果匹配，将周围非旗子的位置打开
      const clickIndex = action.payload.clickIndex;
      const clickItem = state.mines_actual[clickIndex];
      if (clickItem.status !== MineItemStatus.open) return;
      if (clickItem.count === 0) return;

      const aroundItems = getAroundItemsFromArray(state.mines_actual, clickIndex);
      const flagCount = aroundItems.filter((item) => item.item.status === MineItemStatus.flag).length;
      if (flagCount !== clickItem.count) {
        // TODO 最好能闪一下，给个提示
        return;
      }
      // 打开周围没有标记旗子的位置
      const aroundItemsClose = aroundItems.filter((item) => item.item.status === MineItemStatus.close);
      for (let i = 0; i < aroundItemsClose.length; i++) {
        slice.caseReducers.clickLeft(state, {
          type: 'mineSweeper/clickLeft',
          payload: { clickIndex: aroundItemsClose[i].index },
        });
      }
    },
    handleMouseEvent: (state: MineSweeperGameState, action: PayloadAction<{ clickIndex: number; button: number }>) => {
      const gameStatus = state.gameStatus;
      const { clickIndex, button } = action.payload;

      if (gameStatus === MineSweeperStatus.fail || gameStatus === MineSweeperStatus.success) {
        return;
      }
      if (gameStatus === MineSweeperStatus.init) {
        if (button === 0) {
          // 左击开始比赛startGame
          slice.caseReducers.startGame(state, action);
        }
        // 其他不处理
        return;
      }
      if (button === 0) {
        slice.caseReducers.clickLeft(state, action);
      } else if (button === 1) {
        slice.caseReducers.clickMiddle(state, action);
      } else if (button === 2) {
        slice.caseReducers.clickRight(state, action);
      }

      // 点击
    },

    /**
     * 自动扫雷
     * 先初始化游戏，然后点击屏幕中心位置，然后开始扫雷
     */
    autoSweepMine: (state: MineSweeperGameState, action: PayloadAction<{ clickIndex: number; button: number }>) => {

    },
  },
});

export const { initGame, handleMouseEvent, autoSweepMine } = slice.actions;

export default slice.reducer;
