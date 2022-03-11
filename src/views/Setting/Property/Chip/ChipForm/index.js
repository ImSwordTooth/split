import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Popover, Select, Popconfirm, message } from 'antd'
import SelectNodeFromTree from '../../../../components/SelectNodeFromTree'
import ChipParams from './ChipParams'
import { getDataById } from '../../../../utils/common'
import { changeDataMap } from '@action'
import { StyledChipForm } from './styles'

const { Option } = Select
const NEED_NOT_CREATE = []

class ChipForm extends PureComponent {

    static propTypes = {
        index: PropTypes.number, // 节点的第几个碎片
        chip: PropTypes.shape({
            chipId: PropTypes.string,
            chipType: PropTypes.string,
            chipData: PropTypes.object,
        }),
        onChange: PropTypes.func,
        onDelete: PropTypes.func,
        onAdd: PropTypes.func,
        isNew: PropTypes.bool
    }

    static defaultProps = {
        isNew: false
    }

    changeChipValue = (obj) => {
        const newObj = {...obj}
        const { onChange, chip } = this.props
        if (newObj.id !== undefined) {
            onChange({
                ...chip,
                chipId: newObj.id,
                chipData: newObj
            })
            delete newObj.id
        } else {
            onChange({
                ...chip,
                chipData: newObj
            })
        }
    }

    changeChipType = (type) => {
        const { onChange, chip } = this.props

        onChange({
            ...chip,
            chipType: type
        })
    }

    moveChip = (targetId) => {
        const { index, activeId, dataMap } = this.props
        const newDataMap = {...dataMap}
        const node = getDataById(activeId, newDataMap)
        const targetNode = getDataById(targetId, newDataMap)

        const oldChip = node.config.chip
        const newChip = (targetNode.config && targetNode.config.chip) ? targetNode.config.chip : []

        newChip.push(oldChip[index])
        oldChip.splice(index, 1)

        node.config = {
            ...node.config,
            chip: oldChip
        }

        targetNode.config = {
            ...targetNode.config,
            chip: newChip
        }
        changeDataMap(newDataMap)
        message.success('移动成功')
    }

    render() {
        const { chip:{ chipId, chipType, chipData }, onDelete, onAdd, isNew, activeId } = this.props
        return (
            <StyledChipForm>
                <div className="chipType">
                    <span className="formProp">碎片类型 : </span>
                    <Select disabled={!isNew} size="small" value={chipType} style={{ width: '120px' }} onChange={this.changeChipType}>
                        <Option value="">无碎片</Option>
                        <Option value="static">静态碎片</Option>
                        <Option value="recommend">推荐位碎片</Option>
                        <Option value="struct">结构化碎片</Option>
                    </Select>
                </div>
                <div>
                    {
                        chipType && <ChipParams type={chipType} chipId={chipId} data={chipData} onChange={this.changeChipValue}/>
                    }
                </div>
                <div className="btnBox">
                    {
                        !isNew
                            ?
                            <>
                                <Popover
                                    placement="left"
                                    content={
                                        <div style={{ width: '250px' }}>
                                            <div style={{ fontSize: '12px', marginBottom: '4px' }}>选择节点：</div>
                                            <SelectNodeFromTree height={300} disabledId={activeId} onChange={this.moveChip} />
                                        </div>}
                                    trigger={['click']}
                                >
                                    <Button type="primary" ghost size="small" style={{ borderStyle: 'dashed' }}>移动至...</Button>
                                </Popover>
                                <Popover placement="left" content={
                                    <div style={{ fontSize: '12px' }}>
                                        <span>只删除节点里的碎片信息，</span><strong>不会删除 ucms 里的碎片。</strong>
                                    </div>
                                }>
                                    <Popconfirm placement="topRight" title={`确定"删除"这个碎片吗`} okText="确认" cancelText="取消" okType="danger" onConfirm={onDelete}>
                                        <Button danger size="small" ghost style={{ width: '100px' }}>"删除"碎片</Button>
                                    </Popconfirm>
                                </Popover>
                            </>
                            : (chipType && !NEED_NOT_CREATE.includes(chipType) && <Button type="primary" ghost={!!chipData.id} size="small" onClick={onAdd}>{chipData.id ? '添加' : '创建'}碎片</Button>)
                    }
                </div>
            </StyledChipForm>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, dataMap } = state;
    return { activeId, dataMap }
}

export default connect(mapStateToProps)(ChipForm)
