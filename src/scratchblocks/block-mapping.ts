/**
 * 块映射和翻译系统
 */

import type { BlockInfo, LocaleData } from './types.js';
import { BlockType } from './types.js';

export { BlockType };

// 基础块定义（包含常用的 Scratch 3.0 块）
export const allBlocks: Record<string, BlockInfo> = {
  // 事件类
  event_whenflagclicked: {
    defaultMessage: '@greenFlag',
    type: BlockType.HAT,
    translationKey: 'EVENT_WHENFLAGCLICKED',
    boolArg: [],
  },
  event_whenkeypressed: {
    defaultMessage: 'when {KEY_OPTION} key pressed',
    type: BlockType.HAT,
    translationKey: 'EVENT_WHENKEYPRESSED',
    boolArg: [],
  },
  event_whenbroadcastreceived: {
    defaultMessage: 'when I receive {BROADCAST_OPTION}',
    type: BlockType.HAT,
    translationKey: 'EVENT_WHENBROADCASTRECEIVED',
    boolArg: [],
  },
  event_whenbackdropswitchesto: {
    defaultMessage: 'when backdrop switches to {BACKDROP}',
    type: BlockType.HAT,
    translationKey: 'EVENT_WHENBACKDROPSWITCHESTO',
    boolArg: [],
  },
  event_whenthisspriteclicked: {
    defaultMessage: 'when this sprite clicked',
    type: BlockType.HAT,
    translationKey: 'EVENT_WHENTHISSPRITECLICKED',
    boolArg: [],
  },
  event_whenstageclicked: {
    defaultMessage: 'when Stage clicked',
    type: BlockType.HAT,
    translationKey: 'EVENT_WHENSTAGECLICKED',
    boolArg: [],
  },

  // 控制类
  control_if: {
    defaultMessage: 'if {CONDITION} then',
    type: BlockType.C_BLOCK,
    translationKey: 'CONTROL_IF',
    boolArg: ['CONDITION'],
  },
  control_if_else: {
    defaultMessage: 'if {CONDITION} then',
    type: BlockType.E_BLOCK,
    translationKey: 'CONTROL_IF_ELSE',
    boolArg: ['CONDITION'],
  },
  control_repeat: {
    defaultMessage: 'repeat {TIMES}',
    type: BlockType.C_BLOCK,
    translationKey: 'CONTROL_REPEAT',
    boolArg: [],
  },
  control_forever: {
    defaultMessage: 'forever',
    type: BlockType.C_BLOCK,
    translationKey: 'CONTROL_FOREVER',
    boolArg: [],
  },
  control_wait: {
    defaultMessage: 'wait {DURATION} seconds',
    type: BlockType.BLOCK,
    translationKey: 'CONTROL_WAIT',
    boolArg: [],
  },
  control_wait_until: {
    defaultMessage: 'wait until {CONDITION}',
    type: BlockType.BLOCK,
    translationKey: 'CONTROL_WAIT_UNTIL',
    boolArg: ['CONDITION'],
  },
  control_repeat_until: {
    defaultMessage: 'repeat until {CONDITION}',
    type: BlockType.C_BLOCK,
    translationKey: 'CONTROL_REPEAT_UNTIL',
    boolArg: ['CONDITION'],
  },
  control_stop: {
    defaultMessage: 'stop {STOP_OPTION}',
    type: BlockType.CAP,
    translationKey: 'CONTROL_STOP',
    boolArg: [],
  },
  control_start_as_clone: {
    defaultMessage: 'start as a clone',
    type: BlockType.HAT,
    translationKey: 'CONTROL_START_AS_CLONE',
    boolArg: [],
  },
  control_create_clone_of: {
    defaultMessage: 'create clone of {CLONE_OPTION}',
    type: BlockType.BLOCK,
    translationKey: 'CONTROL_CREATE_CLONE_OF',
    boolArg: [],
  },
  control_delete_this_clone: {
    defaultMessage: 'delete this clone',
    type: BlockType.BLOCK,
    translationKey: 'CONTROL_DELETE_THIS_CLONE',
    boolArg: [],
  },

  // 运动类
  motion_movesteps: {
    defaultMessage: 'move {STEPS} steps',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_MOVESTEPS',
    boolArg: [],
  },
  motion_turnright: {
    defaultMessage: '@turnRight {DEGREES} degrees',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_TURNRIGHT',
    boolArg: [],
  },
  motion_turnleft: {
    defaultMessage: '@turnLeft {DEGREES} degrees',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_TURNLEFT',
    boolArg: [],
  },
  motion_gotoxy: {
    defaultMessage: 'go to x:{X} y:{Y}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_GOTOXY',
    boolArg: [],
  },
  motion_goto: {
    defaultMessage: 'go to {TO}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_GOTO',
    boolArg: [],
  },
  motion_glidesecstoxy: {
    defaultMessage: 'glide {SECS} secs to x:{X} y:{Y}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_GLIDESECTSTOXY',
    boolArg: [],
  },
  motion_glideto: {
    defaultMessage: 'glide {SECS} secs to {TO}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_GLIDETO',
    boolArg: [],
  },
  motion_pointindirection: {
    defaultMessage: 'point in direction {DIRECTION}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_POINTINDIRECTION',
    boolArg: [],
  },
  motion_pointtowards: {
    defaultMessage: 'point towards {TOWARDS}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_POINTTOWARDS',
    boolArg: [],
  },
  motion_changexby: {
    defaultMessage: 'change x by {DX}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_CHANGEXBY',
    boolArg: [],
  },
  motion_setx: {
    defaultMessage: 'set x to {X}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_SETX',
    boolArg: [],
  },
  motion_changeyby: {
    defaultMessage: 'change y by {DY}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_CHANGEYBY',
    boolArg: [],
  },
  motion_sety: {
    defaultMessage: 'set y to {Y}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_SETY',
    boolArg: [],
  },
  motion_ifonedgebounce: {
    defaultMessage: 'if on edge, bounce',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_IFONEDGEBOUNCE',
    boolArg: [],
  },
  motion_setrotationstyle: {
    defaultMessage: 'set rotation style {STYLE}',
    type: BlockType.BLOCK,
    translationKey: 'MOTION_SETROTATIONSTYLE',
    boolArg: [],
  },
  motion_xposition: {
    defaultMessage: 'x position',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'MOTION_XPOSITION',
    boolArg: [],
  },
  motion_yposition: {
    defaultMessage: 'y position',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'MOTION_YPOSITION',
    boolArg: [],
  },
  motion_direction: {
    defaultMessage: 'direction',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'MOTION_DIRECTION',
    boolArg: [],
  },

  // 外观类
  looks_sayforsecs: {
    defaultMessage: 'say {MESSAGE} for {SECS} seconds',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_SAYFORSECS',
    boolArg: [],
  },
  looks_say: {
    defaultMessage: 'say {MESSAGE}',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_SAY',
    boolArg: [],
  },
  looks_thinkforsecs: {
    defaultMessage: 'think {MESSAGE} for {SECS} seconds',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_THINKFORSECS',
    boolArg: [],
  },
  looks_think: {
    defaultMessage: 'think {MESSAGE}',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_THINK',
    boolArg: [],
  },
  looks_show: {
    defaultMessage: 'show',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_SHOW',
    boolArg: [],
  },
  looks_hide: {
    defaultMessage: 'hide',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_HIDE',
    boolArg: [],
  },
  looks_switchcostumeto: {
    defaultMessage: 'switch costume to {COSTUME}',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_SWITCHCOSTUMETO',
    boolArg: [],
  },
  looks_nextcostume: {
    defaultMessage: 'next costume',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_NEXTCOSTUME',
    boolArg: [],
  },
  looks_switchbackdropto: {
    defaultMessage: 'switch backdrop to {BACKDROP}',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_SWITCHBACKDROPTO',
    boolArg: [],
  },
  looks_nextbackdrop: {
    defaultMessage: 'next backdrop',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_NEXTBACKDROP',
    boolArg: [],
  },
  looks_changesizeby: {
    defaultMessage: 'change size by {CHANGE}',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_CHANGESIZEBY',
    boolArg: [],
  },
  looks_setsizeto: {
    defaultMessage: 'set size to {SIZE} %',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_SETSIZETO',
    boolArg: [],
  },
  looks_changeeffectby: {
    defaultMessage: 'change {EFFECT} effect by {CHANGE}',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_CHANGEEFFECTBY',
    boolArg: [],
  },
  looks_seteffectto: {
    defaultMessage: 'set {EFFECT} effect to {VALUE}',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_SETEFFECTTO',
    boolArg: [],
  },
  looks_cleargraphiceffects: {
    defaultMessage: 'clear graphic effects',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_CLEARGRAPHICEFFECTS',
    boolArg: [],
  },
  looks_gotofrontback: {
    defaultMessage: 'go to {FRONT_BACK} layer',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_GOTOFRONTBACK',
    boolArg: [],
  },
  looks_goforwardbackwardlayers: {
    defaultMessage: 'go {FORWARD_BACKWARD} {NUM} layers',
    type: BlockType.BLOCK,
    translationKey: 'LOOKS_GOFORWARDBACKWARDLAYERS',
    boolArg: [],
  },
  looks_costumenumbername: {
    defaultMessage: 'costume {NUMBER_NAME}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'LOOKS_COSTUMENUMBERNAME',
    boolArg: [],
  },
  looks_backdropnumbername: {
    defaultMessage: 'backdrop {NUMBER_NAME}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'LOOKS_BACKDROPNUMBERNAME',
    boolArg: [],
  },
  looks_size: {
    defaultMessage: 'size',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'LOOKS_SIZE',
    boolArg: [],
  },

  // 声音类
  sound_playuntildone: {
    defaultMessage: 'play sound {SOUND_MENU} until done',
    type: BlockType.BLOCK,
    translationKey: 'SOUND_PLAYUNTILDONE',
    boolArg: [],
  },
  sound_play: {
    defaultMessage: 'start sound {SOUND_MENU}',
    type: BlockType.BLOCK,
    translationKey: 'SOUND_PLAY',
    boolArg: [],
  },
  sound_stopallsounds: {
    defaultMessage: 'stop all sounds',
    type: BlockType.BLOCK,
    translationKey: 'SOUND_STOPALLSOUNDS',
    boolArg: [],
  },
  sound_changevolumeby: {
    defaultMessage: 'change volume by {VOLUME}',
    type: BlockType.BLOCK,
    translationKey: 'SOUND_CHANGEVOLUMEBY',
    boolArg: [],
  },
  sound_setvolumeto: {
    defaultMessage: 'set volume to {VOLUME} %',
    type: BlockType.BLOCK,
    translationKey: 'SOUND_SETVOLUMETO',
    boolArg: [],
  },
  sound_volume: {
    defaultMessage: 'volume',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SOUND_VOLUME',
    boolArg: [],
  },

  // 侦测类
  sensing_touchingobject: {
    defaultMessage: 'touching {TOUCHINGOBJECTMENU} ?',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'SENSING_TOUCHINGOBJECT',
    boolArg: [],
  },
  sensing_touchingcolor: {
    defaultMessage: 'touching color {COLOR} ?',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'SENSING_TOUCHINGCOLOR',
    boolArg: [],
  },
  sensing_coloristouchingcolor: {
    defaultMessage: 'color {COLOR} is touching {COLOR2} ?',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'SENSING_COLORISTOUCHINGCOLOR',
    boolArg: [],
  },
  sensing_distanceto: {
    defaultMessage: 'distance to {DISTANCETOMENU}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_DISTANCETO',
    boolArg: [],
  },
  sensing_askandwait: {
    defaultMessage: 'ask {QUESTION} and wait',
    type: BlockType.BLOCK,
    translationKey: 'SENSING_ASKANDWAIT',
    boolArg: [],
  },
  sensing_answer: {
    defaultMessage: 'answer',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_ANSWER',
    boolArg: [],
  },
  sensing_keypressed: {
    defaultMessage: 'key {KEY_OPTION} pressed ?',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'SENSING_KEYPRESSED',
    boolArg: [],
  },
  sensing_mousedown: {
    defaultMessage: 'mouse down ?',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'SENSING_MOUSEDOWN',
    boolArg: [],
  },
  sensing_mousex: {
    defaultMessage: 'mouse x',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_MOUSEX',
    boolArg: [],
  },
  sensing_mousey: {
    defaultMessage: 'mouse y',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_MOUSEY',
    boolArg: [],
  },
  sensing_setdragmode: {
    defaultMessage: 'set drag mode {DRAG_MODE}',
    type: BlockType.BLOCK,
    translationKey: 'SENSING_SETDRAGMODE',
    boolArg: [],
  },
  sensing_loudness: {
    defaultMessage: 'loudness',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_LOUDNESS',
    boolArg: [],
  },
  sensing_timer: {
    defaultMessage: 'timer',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_TIMER',
    boolArg: [],
  },
  sensing_resettimer: {
    defaultMessage: 'reset timer',
    type: BlockType.BLOCK,
    translationKey: 'SENSING_RESETTIMER',
    boolArg: [],
  },
  sensing_of: {
    defaultMessage: '{ATTRIBUTE} of {OBJECT}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_OF',
    boolArg: [],
  },
  sensing_current: {
    defaultMessage: 'current {CURRENTMENU}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_CURRENT',
    boolArg: [],
  },
  sensing_dayssince2000: {
    defaultMessage: 'days since 2000',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_DAYSSINCE2000',
    boolArg: [],
  },
  sensing_username: {
    defaultMessage: 'username',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'SENSING_USERNAME',
    boolArg: [],
  },

  // 运算类
  operator_add: {
    defaultMessage: '{NUM1} + {NUM2}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_ADD',
    boolArg: [],
  },
  operator_subtract: {
    defaultMessage: '{NUM1} - {NUM2}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_SUBTRACT',
    boolArg: [],
  },
  operator_multiply: {
    defaultMessage: '{NUM1} * {NUM2}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_MULTIPLY',
    boolArg: [],
  },
  operator_divide: {
    defaultMessage: '{NUM1} / {NUM2}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_DIVIDE',
    boolArg: [],
  },
  operator_random: {
    defaultMessage: 'pick random {FROM} to {TO}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_RANDOM',
    boolArg: [],
  },
  operator_gt: {
    defaultMessage: '{OPERAND1} > {OPERAND2}',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'OPERATOR_GT',
    boolArg: [],
  },
  operator_lt: {
    defaultMessage: '{OPERAND1} < {OPERAND2}',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'OPERATOR_LT',
    boolArg: [],
  },
  operator_equals: {
    defaultMessage: '{OPERAND1} = {OPERAND2}',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'OPERATOR_EQUALS',
    boolArg: [],
  },
  operator_and: {
    defaultMessage: '{OPERAND1} and {OPERAND2}',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'OPERATOR_AND',
    boolArg: [],
  },
  operator_or: {
    defaultMessage: '{OPERAND1} or {OPERAND2}',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'OPERATOR_OR',
    boolArg: [],
  },
  operator_not: {
    defaultMessage: 'not {OPERAND}',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'OPERATOR_NOT',
    boolArg: [],
  },
  operator_join: {
    defaultMessage: 'join {STRING1} {STRING2}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_JOIN',
    boolArg: [],
  },
  operator_letter_of: {
    defaultMessage: 'letter {LETTER} of {STRING}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_LETTER_OF',
    boolArg: [],
  },
  operator_length: {
    defaultMessage: 'length of {STRING}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_LENGTH',
    boolArg: [],
  },
  operator_contains: {
    defaultMessage: '{STRING1} contains {STRING2} ?',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'OPERATOR_CONTAINS',
    boolArg: [],
  },
  operator_mod: {
    defaultMessage: '{NUM1} mod {NUM2}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_MOD',
    boolArg: [],
  },
  operator_round: {
    defaultMessage: 'round {NUM}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_ROUND',
    boolArg: [],
  },
  operator_mathop: {
    defaultMessage: '{OPERATOR} of {NUM}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'OPERATOR_MATHOP',
    boolArg: [],
  },

  // 变量类
  data_setvariableto: {
    defaultMessage: 'set {VARIABLE} to {VALUE}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_SETVARIABLETO',
    boolArg: [],
  },
  data_changevariableby: {
    defaultMessage: 'change {VARIABLE} by {VALUE}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_CHANGEVARIABLEBY',
    boolArg: [],
  },
  data_showvariable: {
    defaultMessage: 'show variable {VARIABLE}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_SHOWVARIABLE',
    boolArg: [],
  },
  data_hidevariable: {
    defaultMessage: 'hide variable {VARIABLE}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_HIDEVARIABLE',
    boolArg: [],
  },
  data_addtolist: {
    defaultMessage: 'add {ITEM} to {LIST}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_ADDTOLIST',
    boolArg: [],
  },
  data_deleteoflist: {
    defaultMessage: 'delete {INDEX} of {LIST}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_DELETEOFLIST',
    boolArg: [],
  },
  data_deletealloflist: {
    defaultMessage: 'delete all of {LIST}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_DELETEALLOFLIST',
    boolArg: [],
  },
  data_insertatlist: {
    defaultMessage: 'insert {ITEM} at {INDEX} of {LIST}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_INSERTATLIST',
    boolArg: [],
  },
  data_replaceitemoflist: {
    defaultMessage: 'replace item {INDEX} of {LIST} with {ITEM}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_REPLACEITEMOFLIST',
    boolArg: [],
  },
  data_itemoflist: {
    defaultMessage: 'item {INDEX} of {LIST}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'DATA_ITEMOFLIST',
    boolArg: [],
  },
  data_itemindexoflist: {
    defaultMessage: 'index of {ITEM} in {LIST}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'DATA_ITEMINDEXOFLIST',
    boolArg: [],
  },
  data_lengthoflist: {
    defaultMessage: 'length of {LIST}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'DATA_LENGTHOFLIST',
    boolArg: [],
  },
  data_listcontainsitem: {
    defaultMessage: '{LIST} contains {ITEM} ?',
    type: BlockType.BOOLEAN_BLOCK,
    translationKey: 'DATA_LISTCONTAINSITEM',
    boolArg: [],
  },
  data_showlist: {
    defaultMessage: 'show list {LIST}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_SHOWLIST',
    boolArg: [],
  },
  data_hidelist: {
    defaultMessage: 'hide list {LIST}',
    type: BlockType.BLOCK,
    translationKey: 'DATA_HIDELIST',
    boolArg: [],
  },

  // 自定义积木
  procedures_definition: {
    defaultMessage: 'define',
    type: BlockType.HAT,
    translationKey: 'PROCEDURES_DEFINITION',
    boolArg: [],
  },
  procedures_call: {
    defaultMessage: 'call',
    type: BlockType.BLOCK,
    translationKey: 'PROCEDURES_CALL',
    boolArg: [],
  },
  procedures_return: {
    defaultMessage: 'stop this script',
    type: BlockType.CAP,
    translationKey: 'PROCEDURES_RETURN',
    boolArg: [],
  },
  event_broadcast: {
    defaultMessage: 'broadcast {BROADCAST_INPUT}',
    type: BlockType.BLOCK,
    translationKey: 'EVENT_BROADCAST',
    boolArg: [],
  },
  pen_clear: {
    defaultMessage: 'erase all',
    type: BlockType.BLOCK,
    translationKey: 'PEN_CLEAR',
    boolArg: [],
  },
  pen_stamp: {
    defaultMessage: 'stamp',
    type: BlockType.BLOCK,
    translationKey: 'PEN_STAMP',
    boolArg: [],
  },
  pen_penDown: {
    defaultMessage: 'pen down',
    type: BlockType.BLOCK,
    translationKey: 'PEN_PENDOWN',
    boolArg: [],
  },
  pen_penUp: {
    defaultMessage: 'pen up',
    type: BlockType.BLOCK,
    translationKey: 'PEN_PENUP',
    boolArg: [],
  },
  pen_setPenColorToColor: {
    defaultMessage: 'set pen color to {COLOR}',
    type: BlockType.BLOCK,
    translationKey: 'PEN_SETPENCOLORTOCOLOR',
    boolArg: [],
  },
  pen_setPenColorParamTo: {
    defaultMessage: 'set pen {COLOR_PARAM} to {VALUE}',
    type: BlockType.BLOCK,
    translationKey: 'PEN_SETPENCOLORPARAMTO',
    boolArg: [],
    remap: { COLOR_PARAM: 'colorParam' },
  },
  pen_changePenColorParamBy: {
    defaultMessage: 'change pen {COLOR_PARAM} by {VALUE}',
    type: BlockType.BLOCK,
    translationKey: 'PEN_CHANGEPENCOLORPARAMBY',
    boolArg: [],
    remap: { COLOR_PARAM: 'colorParam' },
  },
  pen_setPenSizeTo: {
    defaultMessage: 'set pen size to {SIZE}',
    type: BlockType.BLOCK,
    translationKey: 'PEN_SETPENSIZETO',
    boolArg: [],
  },
  pen_changePenSizeBy: {
    defaultMessage: 'change pen size by {SIZE}',
    type: BlockType.BLOCK,
    translationKey: 'PEN_CHANGEPENSIZEBY',
    boolArg: [],
  },
  data_itemnumoflist: {
    defaultMessage: 'item #{NUM} of {LIST}',
    type: BlockType.REPORTER_BLOCK,
    translationKey: 'DATA_ITEMNUMOFLIST',
    boolArg: [],
  },
};

// 简化的选项映射（用于解决块名冲突）
export const blockOptions: Record<string, Record<string, string>> = {
  'control_stop': {
    category: 'control',
  },
  'motion_goto': {
    category: 'motion',
  },
  'looks_gotofrontback': {
    category: 'looks',
  },
  'looks_costumenumbername': {
    category: 'looks',
  },
  'looks_backdropnumbername': {
    category: 'looks',
  },
};

// 获取块消息
export function getMessageForLocale(locale: string, opcode: string): string {
  const blockInfo = allBlocks[opcode];
  if (!blockInfo) {
    return opcode;
  }
  // 这里可以扩展为从翻译文件中获取
  // 目前使用默认的英语消息
  return blockInfo.defaultMessage;
}

// 获取块选项
export function getOptsForLocale(locale: string, opcode: string): Record<string, string> {
  return blockOptions[opcode] || {};
}