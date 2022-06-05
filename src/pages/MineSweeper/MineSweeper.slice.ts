import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
import { GenericErrors } from '../../types/error';
import { MineItem, MineSweeperStatus, MineItemStatus } from '../../types/mine-sweeper';
import { chunk, shuffle, intersection, findIndex, difference, isEqual } from 'lodash';
import { store } from '../../state/store';

export interface MineSweeperGameState {
  gameStatus: MineSweeperStatus;
  mines_initial: MineItem[];
  mines_actual: MineItem[];
  mines_matrix: MineItem[][];
  start_time: Date | null;
  group_2_1: Map<number, number[][]>;
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
      around_mine_count: 0,
      around_count: 8,
      group_2_1: [],
    };
  }
  const mines_actual: MineItem[] = [...mines_initial];
  const mines_matrix: MineItem[][] = chunk(mines_actual, 30);

  return {
    gameStatus: MineSweeperStatus.init,
    mines_initial,
    mines_actual,
    mines_matrix,
    start_time: null,
    group_2_1: new Map(),
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
  if (mineArr[index].around_mine_count === 0) {
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
  // const currentIs0 = currentItem.around_mine_count === 0;
  // const aroundItems = getAroundItemsFromArray(mineArr, index);
  // aroundItems.forEach((item) => {
  //   // if (currentIs0 || item.item.around_mine_count ===0) {}
  //   if ((currentIs0 || item.item.around_mine_count === 0) && item.item.status === MineItemStatus.close && item.item.is_mine === 0) {
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
    initGame: () => {
      console.log('initGame');
      return createInitialState();
    },
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
      // console.log('周围有雷的：');
      // aroundItemsIsMine.forEach((item) => {
      //   console.log(item);
      // });
      // console.log('----------');
      aroundItemsIsMine.forEach((item) => {
        // console.log(item);

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
      state.mines_matrix = chunk(state.mines_actual, 30);

      // 遍历所有区域
      for (let i = 0; i < len; i++) {
        // 确定索引
        const item = state.mines_actual[i];
        item.index = i;

        // 计算每一个区域周围雷的数量
        let x = Math.floor(i / 30);
        let y = i % 30;

        const aroundItems = getAroundItemsFromMatrix(state.mines_matrix, x, y);
        item.around_count = aroundItems.length;
        item.around_mine_count = aroundItems.filter((item) => item.item.is_mine).length;
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
      state.mines_matrix = chunk(state.mines_actual, 30);

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
      state.mines_matrix = chunk(state.mines_actual, 30);
    },
    clickMiddle: (state: MineSweeperGameState, action: PayloadAction<{ clickIndex: number }>) => {
      // 判断数字跟周围的旗子数是否匹配
      // 如果匹配，将周围非旗子的位置打开
      const clickIndex = action.payload.clickIndex;
      const clickItem = state.mines_actual[clickIndex];
      if (clickItem.status !== MineItemStatus.open) return;
      if (clickItem.around_mine_count === 0) return;

      const aroundItems = getAroundItemsFromArray(state.mines_actual, clickIndex);
      const flagCount = aroundItems.filter((item) => item.item.status === MineItemStatus.flag).length;
      if (flagCount !== clickItem.around_mine_count) {
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
    autoSweepMine: (state: MineSweeperGameState) => {
      /**
       * state
       */
      console.log('---1111');
      // slice.caseReducers.initGame();
      // TODO 上面这样为什么不生效
      state = createInitialState();

      setTimeout(() => {
        // 开局
        store.dispatch(handleMouseEvent({ clickIndex: 30 * 7 + 15, button: 0 }));

        setTimeout(() => {
          /**
           * 开始遍历，插旗子
           * 一步一步进行
           */
          store.dispatch(autoSweepMineDoing());
        }, 50);
      });

      return state;
    },

    autoSweepMineDoing: (state: MineSweeperGameState) => {
      if (state.gameStatus !== MineSweeperStatus.doing) return;

      // 本轮是否进行了处理
      let isProcessing = false;
      for (let clickIndex = 0; clickIndex < 30 * 16; clickIndex++) {
        const clickItem = state.mines_actual[clickIndex];
        if (clickItem.resolved || clickItem.status !== MineItemStatus.open || clickItem.around_mine_count === 0) {
          // 如果当前状态为关闭或者插旗子都不处理，只处理打开的
          continue;
        }
        const aroundCount = clickItem.around_count;
        const aroundItems = getAroundItemsFromArray(state.mines_actual, clickIndex);
        if (aroundCount != aroundItems.length) {
          console.error('aroundCount != aroundItems.length');
          return;
        }
        let flagCount = 0;
        let openCount = 0;
        let closeCount = 0;
        const aroundMineCount = clickItem.around_mine_count;

        for (let i = 0; i < aroundItems.length; i++) {
          const item = aroundItems[i];
          if (item.item.status === MineItemStatus.flag) {
            flagCount++;
          } else if (item.item.status === MineItemStatus.open) {
            openCount++;
          } else if (item.item.status === MineItemStatus.close) {
            closeCount++;
          }
        }

        if (flagCount === aroundMineCount) {
          // 旗子数 === 雷数
          if (openCount < aroundCount - aroundMineCount) {
            // 打开数 < 总数 - 雷数(旗子数)
            // 右击
            isProcessing = true;
            setTimeout(() => {
              store.dispatch(handleMouseEvent({ clickIndex: clickIndex, button: 1 }));
              setTimeout(() => {
                store.dispatch(autoSweepMineDoing());
              }, 50);
            }, 50);
          } else {
            // 都打开了，处理完成，不处理
            clickItem.resolved = true;
          }
        } else if (flagCount < aroundMineCount) {
          // 旗子数 < 雷数
          if (openCount === aroundCount - aroundMineCount) {
            // 打开数量 == 总数 - 雷数  说明都打开了，就给未打开的插上旗子
            aroundItems.forEach((item) => {
              if (item.item.status === MineItemStatus.close) {
                item.item.status = MineItemStatus.flag;
              }
            });
            isProcessing = true;
            setTimeout(() => {
              store.dispatch(autoSweepMineDoing());
            });
          } else {
            // 否则打开数量 < 总数 - 雷数。就要进行推断了

            console.log(current(clickItem));

            // m选n
            const maybeCount = closeCount;
            const maybeMineCount = aroundMineCount - flagCount;

            /**
             * 第一种情况
             * flag + close > 雷数
             * close数量为2，雷数 - flag数量为1
             * 为2选1的情况
             */
            if (maybeCount === 2 && maybeMineCount === 1) {
              const indexes = aroundItems
                .filter((item) => item.item.status === MineItemStatus.close)
                .map((item) => item.index)
                .sort((a, b) => a - b);
              indexes.forEach((index) => {
                const others = state.group_2_1.get(index);
                if (others === undefined) {
                  state.group_2_1.set(index, [indexes]);
                } else {
                  if (findIndex(others, (o) => isEqual(o, indexes)) === -1) {
                    others.push(indexes);
                  }
                }
              });
              // console.log(state.group_2_1.entries());
            } else if (maybeCount === 3 && maybeMineCount === 1) {
              // 遇到3选1时，判断是否存在2选1的情况
              // 如果其中时2选1,则另外一个肯定不是雷

              const closeItems = aroundItems.filter((item) => item.item.status === MineItemStatus.close);
              const closeItemsIndexes = closeItems.map((item) => item.index);
              for (let j = 0; j < closeItems.length; j++) {
                // console.log(closeItems.filter((item, index) => index !== j).map((item) => current(item.item.group_2_1)))
                const indexes_arr = state.group_2_1.get(closeItems[j].index);
                if (indexes_arr === undefined) continue;
                console.log(closeItemsIndexes, closeItems[j].index, indexes_arr);
                const indexes = indexes_arr.find((indexes) => {
                  // indexes所有的元素都包含在closeItemsIndexes中
                  return difference(indexes, closeItemsIndexes).length === 0;
                });
                if (indexes) {
                  // 这两个是一对儿
                  // 另外的index就是空的
                  const otherIndex = difference(closeItemsIndexes, indexes);
                  isProcessing = true;

                  setTimeout(() => {
                    store.dispatch(handleMouseEvent({ clickIndex: otherIndex[0], button: 1 }));
                    setTimeout(() => {
                      store.dispatch(autoSweepMineDoing());
                    }, 50);
                  }, 50);
                  break;
                }
              }
            }
          }
        }

        if (isProcessing) {
          break;
        }
      }

      if (!isProcessing) {
        console.log('主人，我不会了，需要你帮忙');
      }

      state.mines_actual = [...state.mines_actual];
      state.mines_matrix = chunk(state.mines_actual, 30);

      return state;
    },
  },
});

export const { initGame, handleMouseEvent, autoSweepMine, autoSweepMineDoing } = slice.actions;

export default slice.reducer;
