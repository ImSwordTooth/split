import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import { StyledConflict } from './styles'
import { Button } from 'antd'

class Conflict extends PureComponent {

    static propTypes = {
        splitChip: PropTypes.array,
        allDataChip: PropTypes.array
    }

    state = {
        infoChangedNum: 0,
        addList: [],
        reduceList: [],
        changeList: {
            add: [], // 以 splitChip 为基准，新增列表
            reduce: [], // 以 splitChip 为基准，减少列表
            infoChange: [] // 同样的碎片，但是 name、title 之类的附加信息变了，记录数量即可
        }
    }

    componentDidMount() {
        const { splitChip, allDataChip } = this.props
        let pureId_split = splitChip.map(s => s.chipId)
        let pureId_allDataId = allDataChip.map(s => s.chipId)
        // splitChip 没有的，是新增的
        const addList = allDataChip.filter(chip => !pureId_split.includes(chip.chipId))
        let reduceList = []
        let infoChangeList = []
        // 遍历 splitChip, 如果 allDataChip 没有，那就是减少的
        for (let chip of splitChip) {
            if (!pureId_allDataId.includes(chip.chipId)) {
                reduceList.push(chip)
            } else {
                let current = allDataChip.find(a => a.chipId === chip.chipId)
                if (chip.chipData.name !== current.chipData.name || chip.chipData.title !== current.chipData.title) {
                    infoChangeList.push(current)
                }
            }
        }
        this.setState({
            changeList: {
                add: addList,
                reduce: reduceList,
                infoChange: infoChangeList
            }
        })
    }
    
    changeStatus = (e) => {
        const { changeList } = this.state
        const { group, id, status } = e.currentTarget.dataset
        const newList = changeList[group].slice()
        newList.find(a => a.chipId === id).status = status
        this.setState({
            changeList: {
                ...changeList,
                [group]: newList
            }
        })
    }

    render() {
        const { changeList: { add, reduce, infoChange } } = this.state
        return (
            <StyledConflict>
                <div className="title">检测到<span className="code">config_split.js</span>和 config.js 中的<span className="code">allData</span>存在碎片冲突：</div>
                {/*<SelectNodeFromTree height={500} />*/}
                <div className="addWp">
                    {
                        add.length > 0 &&
                            <>
                                <div className="tipTitle">
                                    <span className="sign add">新增</span>
                                    这些是 allData 里新增的，建议保留
                                </div>
                                {
                                    add.map((a, index) => {
                                        return (
                                            <div className="conflict" key={index}>
                                                {a.chipId} - {a.chipType}
                                                <div>
                                                    <span className={`btn ${a.status === 'delete' ? 'active' : ''}`} data-group="add" data-id={a.chipId} data-status="delete" onClick={this.changeStatus}>删除</span>
                                                    <span className={`btn primary ${a.status === 'save' ? 'active' : ''}`} data-group="add" data-id={a.chipId} data-status="save" onClick={this.changeStatus}>保留</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </>
                    }
                </div>
                {
                    reduce.length > 0 &&
                        <>
                            <div className="reduceWp">
                                <div className="tipTitle">
                                    <span className="sign reduce">减少</span>
                                    这些是 split_split.js 里有但是 allData 里没有的，大概率没用了
                                </div>
                                {
                                    reduce.map((a, index) => {
                                        return (
                                            <div className="conflict" key={index}>
                                                {a.chipId} - {a.chipType}
                                                <div>
                                                    <span className={`btn ${a.status === 'save' ? 'active' : ''}`} data-group="reduce" data-id={a.chipId} data-status="save" onClick={this.changeStatus}>保留</span>
                                                    <span className={`btn danger ${a.status === 'delete' ? 'active' : ''}`} data-group="reduce" data-id={a.chipId} data-status="delete" onClick={this.changeStatus}>删除</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </>
                }
                {
                    infoChange.length > 0 &&
                    <div className="extra"><span className="sign other">其他</span>还有 <strong>{infoChange.length}</strong> 个碎片的信息有改动，将以 allData 为准自动更新</div>
                }
                <div className="footer">
                    <Button type="primary" shape="round">确定</Button>
                </div>
            </StyledConflict>
        )
    }
}

export default Conflict
