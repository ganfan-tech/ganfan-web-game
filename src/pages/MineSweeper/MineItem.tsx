import { Item } from 'rc-menu';
import { store } from '../../state/store';
import { useStoreWithInitializer, useStore } from '../../state/storeHooks';
import { MineItem, MineItemStatus, MineSweeperStatus } from '../../types/mine-sweeper';
import { handleMouseEvent } from './MineSweeper.slice';


const colors = {
  1: ''
}

export function MineItemComponent({ mine, x, y }: { mine: MineItem; x: number; y: number }) {
  const { mines, gameStatus } = useStore(({ mineSweeper }) => mineSweeper);

  /**
   * 有两种效果，打开或关闭
   *
   *
   * 当游戏结束时，均为打开态
   * 进行中时，每个雷有自己的状态，open为打开态，close或flag时为关闭态
   *
   * 展示效果
   * 尺寸是一样的，
   * 边框效果
   */

  let isOpen = false;
  if (mine.status === MineItemStatus.open) {
    isOpen = true;
  }

  const classes = ['mine-item', isOpen ? 'mine-item-open' : 'mine-item-close'];
  if (mine.is_mine) {
    classes.push('is-mine');
  }
  let text = '';

  if (mine.status === MineItemStatus.open && mine.count > 0) {
    text = `${mine.count}`;
  } 
  if (gameStatus === MineSweeperStatus.init) {
    text = '';
  } else if (gameStatus === MineSweeperStatus.doing) {
    if (mine.status === MineItemStatus.flag) {
      text = '🚩';
    } else if (mine.status === MineItemStatus.open) {
      if (mine.count > 0) {
        text = `${mine.count}`;
      } else {
        text = '';
      }
    } else {
      // close 啥也不显示
      text = '';
    }
  } else if (gameStatus === MineSweeperStatus.success) {
    // 所有的雷都没打开，
    // 所有非雷都打开了
    if (mine.is_mine) {
      text = '💣';
    } else {
      if (mine.count > 0) {
        text = `${mine.count}`;
      } else {
        text = '';
      }
    }
  } else if (gameStatus === MineSweeperStatus.fail) {
    if (mine.isTippingPoint) {
      text = '❌';
    } else if (mine.status === MineItemStatus.flag) {
      text = '🚩';
      if (mine.is_mine === 0) {
        classes.push('flag-error')
      }
    } else if (mine.is_mine) {
      text = '💣';
    }
  }

  // if (mine.isTippingPoint) {
  //   text = '❌';
  // } else if (mine.status === MineItemStatus.open && mine.count > 0) {
  //   text = `${mine.count}`;
  // } 

  // const classes = ['mine-item', isOpen ? 'mine-item-open' : 'mine-item-close'];
  // if (mine.is_mine) {
  //   classes.push('is-mine');
  // }

  return (
    <div
      className={classes.join(' ')}
      // onAuxClick={(e) => {
      //   console.log('auxClick', e);
      // }}
      onMouseUp={(e) => {
        console.log('click', x, y, e);
        store.dispatch(handleMouseEvent({ clickIndex: mine.index, button: e.button }));
      }}
    >
      {/* <p style={{ lineHeight: '15px', margin: 0 }}>{mine.count} {mine.around_count}</p> */}
      <span>
        {text}
      </span>
    </div>
  );
}
