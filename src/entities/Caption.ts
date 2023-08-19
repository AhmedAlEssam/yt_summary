import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, Timestamp  } from "typeorm";
import Transcript from "./Transcript";

@Entity()
export default class Caption extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    lang: string

    @Column({ type: 'longtext' })
    baseUrl: string

    @Column()
    languageCode: string

    @Column({ type: 'longtext' })
    captions_row_data: string

    @Column({ type: 'longtext' })
    modifide_caption: string

    @Column({ type: 'longtext' })
    summary: string

    @CreateDateColumn()
    createdAt: Date

    @ManyToOne(() => Transcript, (transcript) => transcript.captions)
    transcript: Transcript

}