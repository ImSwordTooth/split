import React, { PureComponent } from 'react'
import {Button, Select} from 'antd'
import { connect } from 'react-redux'
import ChipParams from './ChipParams'
import { StyledChipParams } from './styles'

const { Option } = Select

class Chip extends PureComponent {

    state = {
        chipType: '',
        chipData: {}
    }

    handleChipTypeChange = value => this.setState({ chipType: value })
    updateChipData = data => this.setState({ chipData: data })

    getSignature = params => {
        // let arr = [];
        // for (const key of Object.keys(params).sort()) {
        //     if (!params[key]) {
        //         continue;
        //     }
        //     if (key == 'signature') {
        //         continue;
        //     }
        //     if (typeof params[key] == 'object') {
        //         arr.push(`${key}=${JSON.stringify(params[key])}`);
        //     } else {
        //         arr.push(`${key}=${params[key]}`);
        //     }
        // }
        // arr.push(`${key}`);
        // console.log(arr.join('&'));
        // return md5(arr.join('&')).toUpperCase();
    };

    createTrack = async (data) => {
        // const { channel, cname } = this.props
        // const { chipData } = this.state
        // const { name, title, group } = chipData
        //
        // const chipName  = `${channel.name}-${1}-${cname}-${title}`;

        // let content = html;

            // id 不存在 ，创建碎片

        // exports.addStaticFragment = async (channel, channelName, name, content) => {
        //     content = content.trim();
        //     const params = {
        //         name: name,
        //         channel: channel.id,
        //         channelName: channel.id,
        //         content: content,
        //     };
        //     params.signature = getSignature(params);
        //
        //     // console.dir(params, {depth: null});
        //
        //     const result = await request.post({ url: addStaticFragmentUrl, json: params });
        //     console.info({ createChip: {url:addStaticFragmentUrl,params,result}});
        //     return result
        //
        // const res = await axios.post()
        console.log(this.state.chipData)
    }

    render() {
        const { chipType } = this.state
        return (
            <StyledChipParams>
                <div>
                    <span className="formProp">碎片类型 : </span>
                    <Select size="small" value={chipType} style={{ width: '120px' }} onChange={this.handleChipTypeChange}>
                        <Option value="">无碎片</Option>
                        <Option value="static">静态碎片</Option>
                        <Option value="recommend">推荐位碎片</Option>
                        <Option value="struct">结构化碎片</Option>
                    </Select>
                </div>
                {
                    chipType && <ChipParams type={chipType} onChange={this.updateChipData}/>
                }
                <div className="btnBox">
                    {
                        chipType && <Button type="primary" size="small" onClick={this.createTrack}>创建碎片</Button>
                    }
                </div>
            </StyledChipParams>
        )
    }
}

function mapStateToProps(state) {
    const { activeId, dataMap, channel, cname } = state;
    return { activeId, dataMap, channel, cname }
}

export default connect(mapStateToProps)(Chip)
