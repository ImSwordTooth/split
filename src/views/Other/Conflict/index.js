import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {Button, Checkbox, message, Popover} from 'antd'
import SelectNodeFromTree from '../../components/SelectNodeFromTree'
import { getDataById } from '../../utils/common'
import { changeIsFreeze, changeDataMap } from '@action'
import { StyledConflict } from './styles'

class Conflict extends PureComponent {

    static propTypes = {
        splitChip: PropTypes.array,
        allDataChip: PropTypes.array
    }

    state = {
        isConflict: false, // 是否冲突
        changeList: {
            add: [], // 以 splitChip 为基准，新增列表
            reduce: [], // 以 splitChip 为基准，减少列表
            infoChange: [] // 同样的碎片，但是 name、title 之类的附加信息变了，记录数量即可
        },
        finishLoading: false,
        isAddSaveAll: true, // 新增里，保留全部到根节点
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
                    infoChangeList.push({...current, id: chip.id})
                }
            }
        }
        // 全为0，没有冲突
        if (addList.length === 0 && reduceList.length === 0 && infoChangeList.length === 0) {
            this.setState({
                isConflict: false
            })
        } else {
            this.setState({
                changeList: {
                    add: addList,
                    reduce: reduceList,
                    infoChange: infoChangeList
                },
                isConflict: true
            })
            changeIsFreeze(true)
        }
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

    save = (id, nodeId) => {
        const { changeList } = this.state
        const newList = changeList.add.slice()
        newList.find(a => a.chipId === id).status = nodeId
        this.setState({
            changeList: {
                ...changeList,
                add: newList
            }
        })
    }

    finish = () => {
        this.setState({
            finishLoading: true
        })
        const { changeList: { add, reduce, infoChange } } = this.state
        const { dataMap } = this.props
        const newDataMap = {...dataMap}
        for (let a in add) {
            // 新增-保留，新增-删除不用管
            const item = add[a]
            if (item.status && item.status !== 'delete') {
                const node = getDataById(item.status, newDataMap)
                node.config = {
                    ...(node.config || {}),
                    chip: [...((node.config && node.config.chip) || []), {
                        chipType: item.chipType,
                        chipId: item.chipId,
                        chipData: item.chipData
                    }]
                }
            }
        }
        for (let r in reduce) {
            const item = reduce[r]
            // 减少-删除，减少-保留不用管
            if (item.status === 'delete') {
                const node = getDataById(item.id, newDataMap)
                const index = node.config.chip.findIndex(c => c.chipId === item.chipId)
                node.config.chip.splice(index, 1)
            }
        }
        for (let i in infoChange) {
            // 修改
            const item = infoChange[i]
            // // 减少-删除，减少-保留不用管
            const node = getDataById(item.id, newDataMap)
            const targetChip = node.config.chip.find(c => c.chipId === item.chipId)
            targetChip.chipData.title = item.chipData.title
            targetChip.chipData.name = item.chipData.name
        }
        changeDataMap(newDataMap)
        changeIsFreeze(false)
        message.success('冲突解决成功')
        this.setState({
            finishLoading: false,
            isConflict: false
        })
    }
    
    getStatusPercent = () => {
        const { changeList: { add, reduce } } = this.state
        const total = add.concat(reduce)
        return total.filter(t => !!t.status).length / total.length
    }

    toggleIsAddSaveAll = (e) => {
        const { checked } = e.target
        if (checked) {

        } else {

        }
    }

    render() {
        const { isConflict, changeList: { add, reduce, infoChange }, finishLoading, isAddSaveAll } = this.state

        if (!isConflict) {
            return null
        }

        const percent = this.getStatusPercent()

        return (
            <StyledConflict>
                <div className="title">检测到<span className="code">config_split.js</span>和 config.js 中的<span className="code">allData</span>存在碎片冲突：</div>
                <div className="content">
                    {
                        add.length > 0 &&
                        <div className="addWp">
                            <div className="tipTitle">
                                <div>
                                    <span className="sign add">新增</span>
                                    这些是 allData 里新增的，建议保留
                                </div>
                                <div className="saveAll">
                                    <Checkbox checked={isAddSaveAll} onChange={this.toggleIsAddSaveAll}>全部保留到根节点</Checkbox>
                                </div>
                            </div>
                            {
                                add.map((a, index) => {
                                    return (
                                        <div className="conflict" key={index}>
                                            {a.chipId} - {a.chipType} ({a.chipData.title})
                                            {
                                                a.status && a.status !== 'delete' &&
                                                <div className="saveTip">
                                                    保留至：{getDataById(a.status).name}
                                                </div>
                                            }
                                            <div>
                                                <span className={`btn ${a.status === 'delete' ? 'active' : ''}`} data-group="add" data-id={a.chipId} data-status="delete" onClick={this.changeStatus}>删除</span>
                                                <Popover
                                                    placement="right"
                                                    content={
                                                        <div style={{ width: '250px' }}>
                                                            <div style={{ fontSize: '12px', marginBottom: '4px' }}>选择要存储信息的节点：</div>
                                                            <SelectNodeFromTree height={300} value={a.status === 'delete' ? undefined : a.status} onChange={(nodeId) => this.save(a.chipId, nodeId)} />
                                                        </div>}
                                                    trigger={['click']}
                                                >
                                                    <span className={`btn primary ${(a.status && a.status !== 'delete') ? 'active' : ''}`} data-group="add" data-id={a.chipId} data-status="save">保留</span>
                                                </Popover>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    }
                    {
                        reduce.length > 0 &&
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
                    }
                    {
                        infoChange.length > 0 &&
                        <div className="extra"><span className="sign other">其他</span>还有 <strong>{infoChange.length}</strong> 个碎片的信息有改动，将以 allData 为准自动更新</div>
                    }
                </div>

                <div className="footer">
                    <Button type="primary" ghost={percent !== 1} shape="round" loading={finishLoading} onClick={this.finish} disabled={percent !== 1}>
                        确定
                    </Button>
                </div>
            </StyledConflict>
        )
    }
}

function mapStateToProps(state) {
    const { dataMap } = state;
    return { dataMap }
}

export default connect(mapStateToProps)(Conflict)
