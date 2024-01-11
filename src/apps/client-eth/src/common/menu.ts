const checkAndRestart = async (err: any, menu: any) : Promise<void> => {
    if (err != null) {
        console.log("--------------------------------------------------------------------------------")
        console.log("ERROR: %o", err)
        console.log("--------------------------------------------------------------------------------")
        await menu()
    }
}

export const Common = {
    checkAndRestart
}
