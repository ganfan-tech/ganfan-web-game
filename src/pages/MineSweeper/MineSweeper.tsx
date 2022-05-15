import React from 'react';
import { login } from '../../services/conduit';
import { dispatchOnCall, store } from '../../state/store';
import { useStoreWithInitializer } from '../../state/storeHooks';
import { loadUserIntoApp } from '../../types/user';
import { MineItem, MineSweeperStatus } from '../../types/mine-sweeper';
import { GenericForm } from '../../components/GenericForm/GenericForm';
import { initGame, startGame } from './MineSweeper.slice';
import { ContainerPage } from '../../components/ContainerPage/ContainerPage';

import { MineItemComponent } from './MineItem';
import './mine-sweeper.less';

export function MineSweeperGame() {
  const { mines, gameStatus } = useStoreWithInitializer(({ mineSweeper }) => mineSweeper, dispatchOnCall(initGame()));

  /**
   * 99个雷
   *
   * 16 * 30 16行 30列
   *
   * 游戏状态：初始态、进行中、成功、失败
   *
   * item
   * 雷区：是雷、不是雷
   * 数字：0，1，2，3，4，5，6，7，8
   * 状态：打开，遮蔽，插旗子
   *
   * 第一次点击时，布雷，点击处肯定不是雷
   *
   *
   * 状态
   */
  //

  let btnText = '😊';
  if (gameStatus === MineSweeperStatus.success) {
    btnText = '😁';
  } else if (gameStatus === MineSweeperStatus.fail) {
    btnText = '🙄';
  }

  return (
    <div className='mine-sweeper-container'>
      <div className='game-title'>
        <h2>扫雷</h2>
      </div>
      <div className='mine-sweeper-controller'>
        <button
          onClick={() => {
            store.dispatch(initGame());
          }}
        >
          {btnText}
        </button>
      </div>
      <div className='mine-sweeper'>
        <div style={{ backgroundColor: 'gray' }}>
          {mines.map((row, x) => {
            return (
              <div key={row[0].id} className='row' style={{ display: 'flex' }}>
                {row.map((item, y) => {
                  return <MineItemComponent key={item.id} mine={item} x={x} y={y} />;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// function onUpdateField(name: string, value: string) {
//   store.dispatch(updateField({ name: name as keyof LoginState['user'], value }));
// }

// async function signIn(ev: React.FormEvent) {
//   ev.preventDefault();

//   if (store.getState().login.loginIn) return;
//   store.dispatch(startLoginIn());

//   const { email, password } = store.getState().login.user;
//   const result = await login(email, password);

//   result.match({
//     ok: (user) => {
//       location.hash = '/';
//       loadUserIntoApp(user);
//     },
//     err: (e) => {
//       store.dispatch(updateErrors(e));
//     },
//   });
// }
