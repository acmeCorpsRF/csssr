import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";

const createStore = (reducer, initialState) => {
    let currentState = initialState || 0;
    const listeners = [];

    const getState = () => currentState;
    const dispatch = action => {
        currentState = reducer(currentState, action);
        listeners.forEach(listener => listener())
    };

    const subscribe = listener => listeners.push(listener);

    return {getState, dispatch, subscribe};
};

const connect = (mapStateToProps, mapDispatchToProps) =>
    Component => {
        class WrappedComponent extends React.Component {
            render() {
                return (
                    <Component
                        {...this.props}
                        {...mapStateToProps(this.context.store.getState(), this.props)}
                        {...mapDispatchToProps(this.context.store.dispatch, this.props)}
                    />
                )
            }

            componentDidMount() {
                this.context.store.subscribe(this.handleChange) // Поставили подписку с первого монтажа.
            }

            handleChange = () => {
                this.forceUpdate()
            }
        }

        WrappedComponent.contextTypes = {
            store: PropTypes.object,
        };

        return WrappedComponent;
    };

class Provider extends React.Component {
    getChildContext() {
        return {
            store: this.props.store,
        }
    }

    render() {
        return React.Children.only(this.props.children)
    }
}

Provider.childContextTypes = {
    store: PropTypes.object,
};

// APP

// actions
const CHANGE_INTERVAL = 'CHANGE_INTERVAL';

// action creators
const changeInterval = value => ({
    type: CHANGE_INTERVAL,
    payload: value
});


// reducers
const reducer = (state, action) => {
    switch (action.type) {
        case CHANGE_INTERVAL:
            return state += action.payload;
        default:
            return state;
    }
};

// components
class IntervalComponent extends React.PureComponent {

    render() {
        return (
            <div>
                <span>Интервал обновления секундомера: {this.props.currentInterval} сек.</span>
                <span>
                    <button
                        onClick={() => this.props.changeInterval(-1)}
                        disabled={this.props.currentInterval === 0} // Отключаем кнопку, чтобы не уйти в минус.
                    >-</button>
                    <button onClick={() => this.props.changeInterval(1)}>+</button>
                </span>
            </div>
        )
    }
}

const Interval = connect(
    state => ({
        currentInterval: state,
    }),
    dispatch => ({
        changeInterval: value => dispatch(changeInterval(value)), // Порядок перемнных.
    })
)(IntervalComponent);

class TimerComponent extends React.Component {
    state = {
        currentTime: 0,
        buttonDisabled: false
    };
    // Эта привязка обязательна для работы `this` в колбэке. Привязать к контексту.
    // constructor() {
    //     this.handleClick = this.handleClick.bind(this);
    // }
    // <button onClick={() => this.handleClick()}>
    render() {
        return (
            <div>
                <Interval/>
                <div>
                    Секундомер: {this.state.currentTime} сек.
                </div>
                <div>
                    <button
                        onClick={this.handleStart.bind(this)}
                        disabled={this.state.buttonDisabled}
                    >Старт
                    </button>
                    <button onClick={this.handleStop.bind(this)}>Стоп</button>
                </div>
            </div>
        )
    }

    handleStart() {
        let counter = 0;
        this.interval = setInterval(() => {
            this.setState({
                currentTime: this.state.currentTime + 1,
                buttonDisabled: true // Отключаем кнопку, чтобы не запустить повторно таймер.
            });
            counter++;
            if (counter === this.props.currentInterval) {
                clearInterval(this.interval);
                setTimeout(() => {
                    this.setState({
                        currentTime: this.state.currentTime + this.props.currentInterval
                    });
                    this.handleStart();
                }, 1000);
            }
        }, 1000);
    }

    handleStop() {
        clearInterval(this.interval);
        this.setState({
            currentTime: 0,
            buttonDisabled: false
        })
    }
}

const Timer = connect(
    state => ({
        currentInterval: state,
    }),
    () => {
    }
)(TimerComponent);

// init
ReactDOM.render(
    <Provider store={createStore(reducer)}>
        <Timer/>
    </Provider>,
    document.getElementById('app')
);
