// При нажатии на "старт" должен запускаться секундомер и через заданный интервал времени увеличивать свое значение на значение интервала
// При нажатии на "стоп" секундомер должен останавливаться и сбрасывать свое значение

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
                    <div className="WrappedComponent">
                    <Component
                        {...this.props}
                        {...mapStateToProps(this.context.store.getState(), this.props)}
                        {...mapDispatchToProps(this.context.store.dispatch, this.props)}
                    />
                    </div>
                )
            }

            componentDidUpdate() {
                console.log('componentDidUpdate WrappedComponent');
                this.context.store.subscribe(this.handleChange)
            }

            handleChange = () => {
                this.forceUpdate()
            }
        }

        WrappedComponent.contextTypes = {
            store: PropTypes.object,
        };

        return WrappedComponent
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
    payload: value,
});


// reducers
const reducer = (state, action) => {
    switch(action.type) {
        case CHANGE_INTERVAL:
            console.log(state);
            console.log(action);
            return state += action.payload;
        default:
            return state;
    }
};

// components

class IntervalComponent extends React.Component {

    render() {
        console.log(this.props);
        return (
            <div>
                <span>Интервал обновления секундомера: {this.props.currentInterval} сек.</span>
                <span>
                    <button onClick={() => this.props.changeInterval(-1)}>-</button>
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
        changeInterval: value => dispatch(changeInterval(value)), //////////// порядок перемнных.
    })
)(IntervalComponent);

class TimerComponent extends React.Component {
    state = {
        currentTime: 0
    };
    ///////////// bind функций
    render() {
        console.log(this.props);
        return (
            <div>
                <Interval/>
                <div>
                    Секундомер: {this.state.currentTime} сек.
                </div>
                <div>
                    <button onClick={this.handleStart.bind(this)}>Старт</button>
                    <button onClick={this.handleStop.bind(this)}>Стоп</button>
                </div>
            </div>
        )
    }

    handleStart() {
        setTimeout(() => this.setState({
            currentTime: this.state.currentTime + this.props.currentInterval,
        }), this.props.currentInterval)
    }

    handleStop() {
        this.setState({currentTime: 0})
    }
}

const Timer = connect(
    state => ({
        currentInterval: state,
    }),
    () => {}
)(TimerComponent);

// init
ReactDOM.render(
    <Provider store={createStore(reducer)}>
        <Timer/>
    </Provider>,
    document.getElementById('app')
);
