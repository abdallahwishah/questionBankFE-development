export function EnterInPathObj(data: any, path: string[]) {
    if (data) {
        let obj = data;

        path.forEach((path) => {
            obj = obj?.[path];
        });
        return obj;
    }
}
export function flatObj(data: any) {
    let obj: any = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const element = data[key];
            if (element instanceof Object) {
                obj = { ...obj, ...flatObj(element) };
            } else {
                obj[key] = element;
            }
        }
    }
    return obj;
}
export function flatObjForArr(data: any) {
    return data && data?.length ? data.map((value: any) => flatObj(value)) : [];
}

export function hasPermssion(DocLibName: string, permission) {
    return (abp as any).custom?.[DocLibName]?.includes(permission);
}

export function hasPermssion2(DocLibNameWithPermssion: string) {
    if (!DocLibNameWithPermssion) return true;
    if (DocLibNameWithPermssion.includes(',')) {
        let DocLibNameWithPermssions = DocLibNameWithPermssion.split(',');
        return DocLibNameWithPermssions.some((DocLibNameWithPermssion) => {
            let [DocLibName, permission] = DocLibNameWithPermssion.split('_');
            return (abp as any).custom?.[DocLibName]?.includes(permission);
        });
    } else {
        let [DocLibName, permission] = DocLibNameWithPermssion.split('_');
        return (abp as any).custom?.[DocLibName]?.includes(permission);
    }
}
