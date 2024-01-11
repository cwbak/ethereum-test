//TODO 테스트 토큰 어드레스 추가 필요.
const tokenAddressMap = new Map([
    ["spaceboo", "0xf8d4fef9af82de6e57f6aabafd49ff9730242d75"],


])


export const GetTokenAddress = (collectionName: string): string => {
    console.log(collectionName)
    if (!tokenAddressMap.has(collectionName)) {
        throw new Error("Unknown tokenAddress")
    }
    return tokenAddressMap.get(collectionName)!
}