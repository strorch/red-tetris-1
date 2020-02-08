import React from 'react';
import { connect } from 'react-redux';
import { Square } from '../Square';
import { SHIFT, INVISIBLE_ROW_AMOUNT } from '../../constants';

const InnerPile = props => (
  <>
    {props.pile
      .slice(INVISIBLE_ROW_AMOUNT)
      .map((row, rowIndex) =>
        row.map((el, colIndex) =>
          el !== 0 ? (
            <Square
              left={colIndex}
              top={rowIndex}
              color={el}
              key={`${rowIndex}+${colIndex}`}
              shift={SHIFT}
            />
          ) : null,
        ),
      )}
  </>
);

const mapStateToProps = ({ myId, myRoomId, rooms }) => ({
  pile: rooms[myRoomId].players[myId].pile,
});

export const Pile = connect(mapStateToProps)(InnerPile);
