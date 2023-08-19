import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp } from "typeorm";
import Caption from "./Caption";

@Entity()
export default class Transcript extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    eid: string

    @Column()
    url: string

    @CreateDateColumn()
    createdAt: Date

    @Column({ type: 'datetime',default: null })
    expireDate: Date

    @Column({ type: 'boolean',default: false })
    noCaption: boolean

    @Column({ type: 'boolean',default: false })
    noEnglish: boolean

    @CreateDateColumn({ default: null })
    lastEdit: Date
    
    @OneToMany(() => Caption, (caption) => caption.transcript)
    captions: Caption[];

}